import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchProducts } from "../api";
import ProductCard from "./ProductCard";

gsap.registerPlugin(ScrollTrigger);

const ProductGrid = ({
  id,
  limit = null,
  category = "All",
  sortBy = "Featured",
  badge = null,
  brand = null,
  search = null,
  gridView = "4col",
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts({ category, badge, brand, search });
        console.log("FETCHED PRODUCTS:", data); setProducts(data);
      } catch (error) {
        console.error("Backend not reached", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, [category, badge, brand, search]);

  const sortedProducts = useMemo(() => {
    let filtered = [...products];

    if (sortBy === "Featured") {
      filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    } else if (sortBy === "Price: Low to High") {
      filtered.sort((a, b) => {
        const priceA = parseFloat(a.base_price) || 0;
        const priceB = parseFloat(b.base_price) || 0;
        return priceA - priceB;
      });
    } else if (sortBy === "Price: High to Low") {
      filtered.sort((a, b) => {
        const priceA = parseFloat(a.base_price) || 0;
        const priceB = parseFloat(b.base_price) || 0;
        return priceB - priceA;
      });
    } else if (sortBy === "Newest") {
      filtered.reverse();
    }

    return limit ? filtered.slice(0, limit) : filtered;
  }, [products, sortBy, limit]);

  const sectionRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    if (!loading && itemsRef.current.length > 0) {
      gsap.fromTo(
        itemsRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        },
      );
    }
  }, [loading, sortedProducts]);

  if (loading)
    return (
      <div className="py-20 text-center text-gold font-bold">
        Loading Collection...
      </div>
    );

  return (
    <section
      ref={sectionRef}
      id={id}
      className="py-10 sm:py-16 bg-ivory text-charcoal"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <p className="text-gray-500 text-[11px] sm:text-sm">
            Showing{" "}
            <span className="font-bold text-charcoal">
              {sortedProducts.length}
            </span>{" "}
            products
          </p>
        </div>

        <div
          className={`grid grid-cols-2 ${gridView === "4col" ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-3 sm:gap-8 transition-all duration-300`}
        >
          {sortedProducts.map((product, index) => (
            <div key={product.id} ref={(el) => (itemsRef.current[index] = el)}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
