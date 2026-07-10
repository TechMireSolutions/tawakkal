const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") {
    return "Rs. 0";
  }

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(price));
};

export default formatPrice;