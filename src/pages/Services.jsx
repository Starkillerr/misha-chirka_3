import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench } from "@fortawesome/free-solid-svg-icons";
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import { faMobile } from '@fortawesome/free-solid-svg-icons';
import { faAddressCard } from '@fortawesome/free-solid-svg-icons';
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faViber } from "@fortawesome/free-brands-svg-icons";
import { Footer } from '../components/Footer';

export const Services = () => {

return (
    <>
<div className="services">
<div className="montage_container">
<h1 className="montage_name">МОНТАЖ</h1>

    <div className="montage_img"></div>
    <div className="montage_info">
 <ul className="list">
<li><FontAwesomeIcon icon={faWrench} /> Монтаж робіт
</li>
<li><FontAwesomeIcon icon={faClipboardCheck} /> Випробування
</li>
<li><FontAwesomeIcon icon={faMobile} /> Налаштування</li>

        </ul>
    </div>
</div>
<div className='our_contacts'>
    <h1>НАШІ КОНТАКТИ <FontAwesomeIcon icon={faAddressCard} /></h1>
    <span className='tg'> <FontAwesomeIcon icon={faTelegram} /> telegram: @mishachirka </span> 
    
   
<span className='viber'> <FontAwesomeIcon icon={faViber} /> viber: viber </span>
</div>
<div className="projecting_container">
        <h1 className="projecting_name">ПРОЕКТУВАННЯ</h1>

    <div className="projecting_img"></div>
    <div className="projecting_info">
       
    </div>
</div>

</div>
<Footer/>
</>
)

}