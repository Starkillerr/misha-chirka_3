import { Link } from "react-router-dom";
export default function Menu({ open, close }) {


  return (
    <>
     <div
        className={`overlay ${open ? "active" : ""}`}
        onClick={close}
      />


      <aside className={`menu page__menu ${open ? "active" : ""}`}>
        <div className="top-bar menu__top">

          <Link to="/" className="page-img">
          </Link>

          <div className="menu__icons">
            <a className="icon icon--close" onClick={close}></a>
          </div>

        </div>

        <div className="menu__content">

          <nav className="nav menu__nav">
            <ul className="nav__list">
              <li className="nav__item"><Link className="card__name" to="/Services">ПОСЛУГИ</Link></li>
              <li className="nav__item"><Link className="card__name" to="/">ОБЛАДНАННЯ І МАТЕРІАЛИ</Link></li>
              {/* <li className="nav__item"><Link className="card__name" to="#">ВИКЛИК СПЕЦІАЛІСТА</Link></li> */}
            </ul>
          </nav>

        </div>
      </aside>
    </>
  );
}