import { useState, useEffect } from "react";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faViber } from "@fortawesome/free-brands-svg-icons";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
          <p className="footer_description">Нашi контакти</p>
          <div className="footer_socials">
          <a className="footer_social" href="tel:+3806877777"><FontAwesomeIcon icon={faTelegram} /></a>
          <a className="footer_social" href="tel:+3806877777"><FontAwesomeIcon icon={faViber} /></a>
          </div>
          
          <a className="footer_number" href="tel:+3806877777"><FontAwesomeIcon icon={faPhone} /> +380 68777 77</a>
         
        </div> 

        <button className={`toTop back-to-top ${isVisible ? "toTop--visible" : ""}`} onClick={scrollToTop} aria-label="До гори">↑</button>
      </footer> 
    )
}