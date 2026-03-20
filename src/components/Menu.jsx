import { Link } from "react-router-dom";
export default function Menu({ open, close }) {

  if (!open) return null;

  return (
    <>
      <div className="overlay active" onClick={close}></div>

      <aside className="menu page__menu active">
        <div className="top-bar menu__top">

          <a href="#" className="page-img">
            <img src={`${import.meta.env.BASE_URL}/imgs/app_logo.png`} alt="Sun Core"/>
          </a>

          <div className="menu__icons">
            <a className="icon icon--close" onClick={close}></a>
          </div>

        </div>

        <div className="menu__content">

          <nav className="nav menu__nav">
            <ul className="nav__list">
              <li className="nav__item"><Link className="card__name" to="/Services">ПОСЛУГИ</Link></li>
              <li className="nav__item"><Link className="card__name" to="/#catalog">ОБЛАДНАННЯ І МАТЕРІАЛИ</Link></li>
              <li className="nav__item"><Link className="card__name" to="#">ВИКЛИК СПЕЦІАЛІСТА</Link></li>
            </ul>
          </nav>

        </div>
      </aside>
    </>
  );
}