import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiArrowRight,
} from "react-icons/hi2";
import { authService } from "../../services/auth.service";
import Button from "../../components/ui/Button";
import { useSiteSettings } from "../../../context/SiteSettingsContext";
import "../../styles/admin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);
  const siteSettings = useSiteSettings();

  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.login({ email, password });
      window.location.href = from; // Use window.location to trigger a full reload to initialize Context
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid credentials or server error.",
      );
      setLoading(false);
    }
  };

  return (
    <div
      className="admin-root"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--admin-background)",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "var(--admin-surface)",
          padding: "40px",
          borderRadius: "var(--admin-radius-2xl)",
          boxShadow: "var(--admin-shadow-lg)",
          border: "1px solid var(--admin-border)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            {(siteSettings?.login_logo_url || siteSettings?.main_logo_url) &&
            !imgError ? (
              <img
                src={
                  siteSettings?.login_logo_url || siteSettings?.main_logo_url
                }
                alt={siteSettings?.site_name || "Tawakkal"}
                style={{ maxHeight: "32px", objectFit: "contain" }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  background: "var(--admin-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HiOutlineLockClosed size={24} color="white" />
              </div>
            )}
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--admin-text)",
              marginBottom: "8px",
              fontFamily: "var(--admin-font-display)",
            }}
          >
            Admin Panel
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--admin-text-muted)",
              margin: 0,
            }}
          >
            Sign in to access your dashboard
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              background: "#fee2e2",
              color: "#b91c1c",
              borderRadius: "var(--admin-radius-md)",
              fontSize: "13px",
              marginBottom: "20px",
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--admin-text)",
                marginBottom: "8px",
              }}
            >
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: 10,
                  color: "var(--admin-text-muted)",
                }}
              >
                <HiOutlineEnvelope size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tawakkal.com"
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  borderRadius: "var(--admin-radius-md)",
                  border: "1px solid var(--admin-border)",
                  background: "var(--admin-bg)",
                  color: "var(--admin-text)",
                  fontSize: "14px",
                  outline: "none",
                }}
                required
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--admin-text)",
                marginBottom: "8px",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: 10,
                  color: "var(--admin-text-muted)",
                }}
              >
                <HiOutlineLockClosed size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  borderRadius: "var(--admin-radius-md)",
                  border: "1px solid var(--admin-border)",
                  background: "var(--admin-bg)",
                  color: "var(--admin-text)",
                  fontSize: "14px",
                  outline: "none",
                }}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
            iconRight={HiArrowRight}
            style={{
              marginTop: "8px",
            }}
          >
            Sign In
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
