import { useState, useEffect } from "react";
export const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        isVisible && setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [isVisible]);
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
    return (
       <footer className="footer">
        <div className="footer_contacts">
          <a className="footer_number" href="tel:+3806877777">+380 68777 77</a>
          <a className="footer_number" href="tel:+3806877777">+380 68777 77</a>
        </div> 
        <button className={`toTop back-to-top ${isVisible ? "toTop--visible" : ""}`} onClick={scrollToTop} aria-label="До гори">↑</button>
      </footer> 
    )
}