import { useState, useEffect } from "react";
import {
  PageContainer,
  PageHeader,
  FormSection,
} from "../../components/ui/PageLayout";
import Tabs from "../../components/ui/Tabs";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ImageUploader from "../../components/ui/ImageUploader";
import VideoUploader from "../../components/ui/VideoUploader";
import { useToast } from "../../components/ui/Toast";
import {
  fetchSiteSettings,
  updateSiteSettings,
  uploadMedia,
} from "../../../api";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSiteSettings();
        setSettings(data);
      } catch {
        setSettings({});
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <PageContainer>
        <div>Loading settings...</div>
      </PageContainer>
    );

  const tabs = [
    { label: "General", content: <GeneralSettings data={settings} /> },
    { label: "Branding", content: <BrandingSettings data={settings} /> },
    { label: "Contact & Social", content: <ContactSettings data={settings} /> },
    { label: "Homepage Hero", content: <HeroSettings data={settings} /> },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        subtitle="Manage your store settings"
        breadcrumbs={[{ label: "Settings" }]}
      />
      <Tabs tabs={tabs} />
    </PageContainer>
  );
}

function GeneralSettings({ data }) {
  const toast = useToast();
  const [values, setValues] = useState({
    site_name: data?.site_name || "",
    site_description: data?.site_description || "",
  });

  const handleChange = (e, field) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    try {
      await updateSiteSettings(null, values);
      toast.success("General settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  return (
    <FormSection title="General Settings" subtitle="Basic store information">
      <Input
        label="Site Name"
        value={values.site_name}
        onChange={(e) => handleChange(e, "site_name")}
      />
      <Input
        label="Tagline / Description"
        value={values.site_description}
        onChange={(e) => handleChange(e, "site_description")}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "12px",
        }}
      >
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </FormSection>
  );
}

function BrandingSettings({ data }) {
  const toast = useToast();
  const [values, setValues] = useState({
    primary_color: data?.primary_color || "",
    secondary_color: data?.secondary_color || "",
  });

  const [files, setFiles] = useState({});
  const [removes, setRemoves] = useState({});

  const handleChange = (e, field) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (field, file) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
    setRemoves((prev) => ({ ...prev, [field]: false }));
  };

  const handleFileRemove = (field) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setRemoves((prev) => ({ ...prev, [field]: true }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("primary_color", values.primary_color);
      formData.append("secondary_color", values.secondary_color);

      const logoFields = [
        "main_logo",
        "navbar_logo",
        "sticky_navbar_logo",
        "preloader_logo",
        "footer_logo",
        "login_logo",
        "favicon",
        "apple_touch_icon",
        "social_sharing_image",
        "email_header_logo",
      ];

      for (const field of logoFields) {
        if (files[field]) {
          formData.append(field, files[field]);
        }
        if (removes[field]) {
          formData.append(`${field}_remove`, "true");
        }
      }

      await updateSiteSettings(null, formData);
      toast.success("Branding saved successfully");
    } catch {
      toast.error("Failed to save branding");
    }
  };

  const logos = [
    {
      key: "main_logo",
      label: "Main Logo",
      desc: "Primary company logo used across the site.",
    },
    {
      key: "navbar_logo",
      label: "Navbar Logo",
      desc: "Displayed in the top navigation bar.",
    },
    {
      key: "sticky_navbar_logo",
      label: "Sticky Navbar Logo",
      desc: "Displayed when the user scrolls down.",
    },
    {
      key: "preloader_logo",
      label: "Preloader Logo",
      desc: "Shown during the initial page load.",
    },
    {
      key: "footer_logo",
      label: "Footer Logo",
      desc: "Displayed at the bottom of the website.",
    },
    {
      key: "login_logo",
      label: "Login Logo",
      desc: "Shown on the admin and customer login pages.",
    },
    {
      key: "favicon",
      label: "Favicon",
      desc: "Browser tab icon (must be square, e.g. 32x32).",
    },
    {
      key: "apple_touch_icon",
      label: "Apple Touch Icon",
      desc: "Used for iOS home screen shortcuts (180x180).",
    },
    {
      key: "social_sharing_image",
      label: "Social Sharing Image",
      desc: "Used for Facebook/Twitter link previews (1200x630).",
    },
    {
      key: "email_header_logo",
      label: "Email Header Logo",
      desc: "Displayed at the top of system emails.",
    },
  ];

  return (
    <FormSection title="Branding" subtitle="Logos, icons, and brand colors">

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
        }}
      >
        {logos.map((logo) => (
          <ImageUploader
            key={logo.key}
            label={logo.label}
            description={logo.desc}
            initialUrl={data?.[`${logo.key}_url`]}
            onChange={(file) => handleFileChange(logo.key, file)}
            onRemove={() => handleFileRemove(logo.key)}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "12px",
          borderTop: "1px solid var(--admin-border-light)",
          marginTop: "24px",
        }}
      >
        <Button onClick={handleSave}>Save Branding Changes</Button>
      </div>
    </FormSection>
  );
}

function ContactSettings({ data }) {
  const toast = useToast();
  const [values, setValues] = useState({
    contact_email: data?.contact_email || "",
    contact_phone: data?.contact_phone || "",
    address: data?.address || "",
    facebook_url: data?.facebook_url || "",
    instagram_url: data?.instagram_url || "",
    twitter_url: data?.twitter_url || "",
    linkedin_url: data?.linkedin_url || "",
    tiktok_profile_url: data?.tiktok_profile_url || "",
    tiktok_embed_code: data?.tiktok_embed_code || "",
  });

  const handleChange = (e, field) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    try {
      await updateSiteSettings(null, values);
      toast.success("Contact info saved");
    } catch {
      toast.error("Failed to save contact info");
    }
  };

  return (
    <FormSection
      title="Contact & Social Info"
      subtitle="Public contact details and social media links"
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        <Input
          label="Contact Email"
          type="email"
          value={values.contact_email}
          onChange={(e) => handleChange(e, "contact_email")}
        />
        <Input
          label="Contact Phone"
          value={values.contact_phone}
          onChange={(e) => handleChange(e, "contact_phone")}
        />
      </div>
      <Input
        label="Physical Address"
        value={values.address}
        onChange={(e) => handleChange(e, "address")}
      />

      <div style={{ marginTop: "24px", marginBottom: "8px" }}>
        <h4
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--admin-text)",
          }}
        >
          Social Media Links
        </h4>
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        <Input
          label="Facebook URL"
          value={values.facebook_url}
          onChange={(e) => handleChange(e, "facebook_url")}
        />
        <Input
          label="Instagram URL"
          value={values.instagram_url}
          onChange={(e) => handleChange(e, "instagram_url")}
        />
        <Input
          label="Twitter URL"
          value={values.twitter_url}
          onChange={(e) => handleChange(e, "twitter_url")}
        />
        <Input
          label="LinkedIn URL"
          value={values.linkedin_url}
          onChange={(e) => handleChange(e, "linkedin_url")}
        />
        <Input
          label="TikTok URL"
          value={values.tiktok_profile_url}
          onChange={(e) => handleChange(e, "tiktok_profile_url")}
        />
      </div>
      <div style={{ marginTop: "16px" }}>
        <Input
          label="TikTok Embed Code (for Homepage Reels)"
          as="textarea"
          rows={3}
          value={values.tiktok_embed_code}
          onChange={(e) => handleChange(e, "tiktok_embed_code")}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "12px",
        }}
      >
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </FormSection>
  );
}

function HeroSettings({ data }) {
  const toast = useToast();
  const [values, setValues] = useState({
    hero_enabled: data?.hero_enabled ?? true,
    hero_background_enabled: data?.hero_background_enabled ?? true,
    hero_left_image_enabled: data?.hero_left_image_enabled ?? true,
    hero_right_image_enabled: data?.hero_right_image_enabled ?? true,
    hero_overlay_opacity: data?.hero_overlay_opacity ?? 0.35,
    hero_height: data?.hero_height || "100vh",
    hero_mobile_height: data?.hero_mobile_height || "70vh",
    hero_small_text: data?.hero_small_text || "",
    hero_subtitle: data?.hero_subtitle || "",
    hero_title: data?.hero_title || "",
    hero_highlight_title: data?.hero_highlight_title || "",
    hero_left_button_text: data?.hero_left_button_text || "",
    hero_left_button_link: data?.hero_left_button_link || "",
    hero_left_button_style: data?.hero_left_button_style || "primary",
    hero_center_button_text: data?.hero_center_button_text || "",
    hero_center_button_link: data?.hero_center_button_link || "",
    hero_center_button_style: data?.hero_center_button_style || "primary",
    hero_right_button_text: data?.hero_right_button_text || "",
    hero_right_button_link: data?.hero_right_button_link || "",
    hero_right_button_style: data?.hero_right_button_style || "primary",
  });

  const [files, setFiles] = useState({});
  const [removes, setRemoves] = useState({});

  const handleChange = (e, field) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((prev) => ({ ...prev, [field]: val }));
  };

  const handleFileChange = (field, file) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
    setRemoves((prev) => ({ ...prev, [field]: false }));
  };

  const handleFileRemove = (field) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setRemoves((prev) => ({ ...prev, [field]: true }));
  };

  const handleSave = async () => {
    try {
      const payload = { ...values };

      const mediaFields = [
        "hero_background",
        "hero_left_image",
        "hero_right_image",
        "hero_video",
        "hero_mobile_background",
        "hero_mobile_left_image",
        "hero_mobile_right_image",
      ];
      for (const field of mediaFields) {
        if (files[field]) {
          const res = await uploadMedia(files[field]);
          payload[field] = res.id;
        } else if (removes[field]) {
          payload[field] = null;
        }
      }

      await updateSiteSettings(null, payload);
      toast.success("Hero settings saved");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Failed to save Hero settings");
    }
  };

  const images = [
    { key: "hero_background", label: "Background Image" },
    { key: "hero_left_image", label: "Left Image" },
    { key: "hero_right_image", label: "Right Image" },
    { key: "hero_mobile_background", label: "Mobile Background" },
    { key: "hero_mobile_left_image", label: "Mobile Left Image" },
    { key: "hero_mobile_right_image", label: "Mobile Right Image" },
  ];

  return (
    <FormSection
      title="Homepage Hero CMS"
      subtitle="Configure hero section content, images, and buttons"
    >
      {/* Display Controls */}
      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          background: "var(--admin-surface-secondary)",
          borderRadius: "8px",
        }}
      >
        <h4 style={{ fontSize: "14px", marginBottom: "12px" }}>
          Display Controls
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={values.hero_enabled}
              onChange={(e) => handleChange(e, "hero_enabled")}
            />{" "}
            Hero Enabled
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={values.hero_background_enabled}
              onChange={(e) => handleChange(e, "hero_background_enabled")}
            />{" "}
            Background Enabled
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={values.hero_left_image_enabled}
              onChange={(e) => handleChange(e, "hero_left_image_enabled")}
            />{" "}
            Left Image Enabled
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={values.hero_right_image_enabled}
              onChange={(e) => handleChange(e, "hero_right_image_enabled")}
            />{" "}
            Right Image Enabled
          </label>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
          }}
        >
          <Input
            label="Overlay Opacity (0.0 to 1.0)"
            type="number"
            step="0.05"
            value={values.hero_overlay_opacity}
            onChange={(e) => handleChange(e, "hero_overlay_opacity")}
          />
          <Input
            label="Desktop Height"
            value={values.hero_height}
            onChange={(e) => handleChange(e, "hero_height")}
          />
          <Input
            label="Mobile Height"
            value={values.hero_mobile_height}
            onChange={(e) => handleChange(e, "hero_mobile_height")}
          />
        </div>
      </div>

      {/* Images */}
      <h4 style={{ fontSize: "14px", marginBottom: "12px", marginTop: "24px" }}>
        Hero Images
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        {images.map((img) => (
          <ImageUploader
            key={img.key}
            label={img.label}
            initialUrl={data?.[`${img.key}_url`]}
            onChange={(file) => handleFileChange(img.key, file)}
            onRemove={() => handleFileRemove(img.key)}
          />
        ))}
      </div>

      {/* Background Video */}
      <h4 style={{ fontSize: "14px", marginBottom: "12px", marginTop: "24px" }}>
        Background Video
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        <VideoUploader
          key="hero_video"
          label="Video (Optional)"
          description="Background video overlay for the hero section."
          initialUrl={data?.hero_video_url}
          onChange={(file) => handleFileChange("hero_video", file)}
          onRemove={() => handleFileRemove("hero_video")}
        />
      </div>

      {/* Text Content */}
      <h4 style={{ fontSize: "14px", marginBottom: "12px", marginTop: "24px" }}>
        Text Content
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--admin-text)",
              marginBottom: "6px",
            }}
          >
            Small Text
          </label>
          <textarea
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "10px 14px",
              border: "1px solid var(--admin-border)",
              borderRadius: "var(--admin-radius-md)",
              fontSize: "14px",
              fontFamily: "var(--admin-font-sans)",
              resize: "vertical",
            }}
            value={values.hero_small_text}
            onChange={(e) => handleChange(e, "hero_small_text")}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--admin-text)",
              marginBottom: "6px",
            }}
          >
            Subtitle
          </label>
          <textarea
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "10px 14px",
              border: "1px solid var(--admin-border)",
              borderRadius: "var(--admin-radius-md)",
              fontSize: "14px",
              fontFamily: "var(--admin-font-sans)",
              resize: "vertical",
            }}
            value={values.hero_subtitle}
            onChange={(e) => handleChange(e, "hero_subtitle")}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--admin-text)",
              marginBottom: "6px",
            }}
          >
            Main Title
          </label>
          <textarea
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "10px 14px",
              border: "1px solid var(--admin-border)",
              borderRadius: "var(--admin-radius-md)",
              fontSize: "14px",
              fontFamily: "var(--admin-font-sans)",
              resize: "vertical",
            }}
            value={values.hero_title}
            onChange={(e) => handleChange(e, "hero_title")}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--admin-text)",
              marginBottom: "6px",
            }}
          >
            Highlight Title
          </label>
          <textarea
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "10px 14px",
              border: "1px solid var(--admin-border)",
              borderRadius: "var(--admin-radius-md)",
              fontSize: "14px",
              fontFamily: "var(--admin-font-sans)",
              resize: "vertical",
            }}
            value={values.hero_highlight_title}
            onChange={(e) => handleChange(e, "hero_highlight_title")}
          />
        </div>
      </div>

      {/* Buttons */}
      <h4 style={{ fontSize: "14px", marginBottom: "12px", marginTop: "24px" }}>
        Buttons
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {[
          { prefix: "hero_left", label: "Left Button" },
          { prefix: "hero_center", label: "Center Button" },
          { prefix: "hero_right", label: "Right Button" },
        ].map((btn) => (
          <div
            key={btn.prefix}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 1fr",
              gap: "16px",
              background: "var(--admin-surface-secondary)",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            <Input
              label={`${btn.label} Text`}
              value={values[`${btn.prefix}_button_text`]}
              onChange={(e) => handleChange(e, `${btn.prefix}_button_text`)}
            />
            <Input
              label={`${btn.label} Link`}
              value={values[`${btn.prefix}_button_link`]}
              onChange={(e) => handleChange(e, `${btn.prefix}_button_link`)}
            />
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--admin-text)",
                  marginBottom: "6px",
                }}
              >
                {btn.label} Style
              </label>
              <select
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 14px",
                  fontSize: "14px",
                  border: "1px solid var(--admin-border)",
                  borderRadius: "var(--admin-radius-md)",
                  background: "var(--admin-surface)",
                  fontFamily: "var(--admin-font-sans)",
                  color: "var(--admin-text)",
                  cursor: "pointer",
                }}
                value={values[`${btn.prefix}_button_style`]}
                onChange={(e) => handleChange(e, `${btn.prefix}_button_style`)}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "12px",
          borderTop: "1px solid var(--admin-border-light)",
          marginTop: "24px",
        }}
      >
        <Button onClick={handleSave}>Save Hero Settings</Button>
      </div>
    </FormSection>
  );
}
