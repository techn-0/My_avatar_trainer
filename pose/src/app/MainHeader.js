import { Link } from "react-router-dom";
import Drawer from "./MainHeader";
import PersistentDrawerLeft from "./Drawer";
// mui

const MainHeader = () => {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/login">Login!!</Link>
          </li>
        </ul>
        <PersistentDrawerLeft />
      </nav>
    </header>
  );
};

export default MainHeader;
