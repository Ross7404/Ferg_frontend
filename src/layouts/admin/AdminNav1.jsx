import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom"; 
import PropTypes from 'prop-types';
import {
  AiOutlineHome,
  AiOutlineUser,
  AiOutlineSetting,
  AiOutlineBarChart,
  AiOutlineDown,
  AiOutlineUp,
  AiOutlineFolder,
  AiOutlineVideoCamera,
  AiOutlineStar,
  AiOutlineShop,
  AiOutlineCoffee,
  AiOutlineGift,
  AiOutlineTeam,
  AiOutlinePercentage,
  AiOutlineMessage,
  AiOutlineShopping,
  AiOutlineFileText
} from "react-icons/ai";

const MenuItem = ({ icon: Icon, text, to, isCollapsed, isActive, onClick }) => (
  <Link 
    to={to} 
    className={`flex items-center py-3 px-4 rounded-lg hover:bg-[var(--accent-color)] group transition-all duration-200 relative 
      ${isActive ? 'bg-[var(--accent-color)]' : ''}`}
    onClick={onClick}
  >
    <span className="flex items-center justify-center w-8">
      <Icon className={`text-xl ${isActive ? 'text-[var(--primary-dark)]' : 'text-[var(--primary-dark)] group-hover:text-[var(--primary-dark)]'} transition-colors duration-200`} />
    </span>
    {!isCollapsed && (
      <span className={`ml-3 text-sm font-medium ${isActive ? 'text-[var(--primary-dark)]' : 'text-[var(--primary-dark)] group-hover:text-[var(--primary-dark)]'} tracking-wide`}>
        {text}
      </span>
    )}
    <div className={`absolute left-0 w-1 ${isActive ? 'h-full' : 'h-0 group-hover:h-full'} bg-[var(--accent-color)] rounded-r-lg transition-all duration-200`} />
  </Link>
);

MenuItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  text: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func
};

const SubMenuItem = ({ icon: Icon, text, to, isActive, onClick }) => (
  <Link 
    to={to} 
    className={`flex items-center py-2.5 px-4 rounded-lg hover:bg-[var(--accent-color)] group transition-all duration-200 ml-8 relative
      ${isActive ? 'bg-[var(--accent-color)]' : ''}`}
    onClick={onClick}
  >
    <span className="flex items-center justify-center w-6">
      <Icon className={`text-lg ${isActive ? 'text-[var(--primary-dark)]' : 'text-[var(--primary-dark)] group-hover:text-[var(--primary-dark)]'} transition-colors duration-200`} />
    </span>
    <span className={`ml-3 text-sm font-medium ${isActive ? 'text-[var(--primary-dark)]' : 'text-[var(--primary-dark)] group-hover:text-[var(--primary-dark)]'}`}>
      {text}
    </span>
    <div className={`absolute left-0 w-1 ${isActive ? 'h-full' : 'h-0 group-hover:h-full'} bg-[var(--accent-color)] rounded-r-lg transition-all duration-200`} />
  </Link>
);

SubMenuItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  text: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func
};

const MenuGroup = ({ id, icon: Icon, title, children, isCollapsed, isActive }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  useEffect(() => {
    // Auto expand menu group if it contains the active route
    if (isActive && !activeSubmenu) {
      setActiveSubmenu(id);
    }
  }, [isActive, id, activeSubmenu]);

  const toggleSubmenu = (menu) => {
    setActiveSubmenu(activeSubmenu === menu ? null : menu);
  };

  return (
    <div className="group">
      <div
        onClick={() => toggleSubmenu(id)}
        className={`flex items-center justify-between py-3 px-4 rounded-lg hover:bg-[var(--accent-color)] cursor-pointer group transition-all duration-200 relative
          ${isActive || activeSubmenu === id ? 'bg-[var(--accent-color)]' : ''}`}
      >
        <div className="flex items-center">
          <span className="flex items-center justify-center w-8">
            <Icon className={`text-xl ${isActive ? 'text-[var(--primary-dark)]' : 'text-[var(--primary-dark)] group-hover:text-[var(--primary-dark)]'} transition-colors duration-200`} />
          </span>
          {!isCollapsed && (
            <span className={`ml-3 text-sm font-medium ${isActive ? 'text-[var(--primary-dark)]' : 'text-[var(--primary-dark)] group-hover:text-[var(--primary-dark)]'} tracking-wide`}>
              {title}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <span className="transform transition-transform duration-300">
            {activeSubmenu === id ? (
              <AiOutlineUp className="text-lg text-[var(--primary-dark)] group-hover:text-[var(--primary-dark)]" />
            ) : (
              <AiOutlineDown className="text-lg text-[var(--primary-dark)] group-hover:text-[var(--primary-dark)]" />
            )}
          </span>
        )}
        <div className={`absolute left-0 w-1 ${isActive || activeSubmenu === id ? 'h-full' : 'h-0 group-hover:h-full'} bg-[var(--accent-color)] rounded-r-lg transition-all duration-200`} />
      </div>
      {!isCollapsed && (
        <div className={`overflow-hidden transition-all duration-300 ${
          activeSubmenu === id ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
        }`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default function AdminNav1({ isCollapsed, onNavLinkClick, userRole = "admin" }) {  
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if current path belongs to this menu group
  const isPathInGroup = (paths) => {
    return paths.some(path => currentPath.includes(path));
  };

  // Check role to display appropriate menu
  const isAdmin = userRole === "admin"; // Full permissions
  const isBranchAdmin = userRole === "branch_admin";

  return (
    <nav className="py-4 text-[var(--primary-dark)]">
      <div className="space-y-2">
        <MenuItem 
          icon={AiOutlineHome} 
          text="Dashboard" 
          to="/admin" 
          isCollapsed={isCollapsed} 
          isActive={currentPath === "/admin"}
          onClick={onNavLinkClick}
        />

        {/* Only admin can see Users menu */}
        {isAdmin && (
          <MenuGroup 
            id="users" 
            icon={AiOutlineTeam} 
            title="Users" 
            isCollapsed={isCollapsed}
            isActive={isPathInGroup(["users", "branch-admins"])}
          >
            <SubMenuItem 
              icon={AiOutlineUser} 
              text="Administrators" 
              to="/admin/branch-admins" 
              isActive={currentPath.includes("branch-admins")}
              onClick={onNavLinkClick}
            />
            <SubMenuItem 
              icon={AiOutlineUser} 
              text="Customers" 
              to="/admin/users" 
              isActive={currentPath.includes("users")}
              onClick={onNavLinkClick}
            />
          </MenuGroup>
        )}

        <MenuGroup 
          id="movies" 
          icon={AiOutlineVideoCamera} 
          title="Movies" 
          isCollapsed={isCollapsed}
          isActive={isPathInGroup(["movies", "genre", "actors", "directors", "producers"])}
        >
          <SubMenuItem 
            icon={AiOutlineFolder} 
            text="Movie Genres" 
            to="/admin/genre" 
            isActive={currentPath.includes("genre")}
            onClick={onNavLinkClick}
          />
          <SubMenuItem 
            icon={AiOutlineVideoCamera} 
            text="Movies" 
            to="/admin/movies" 
            isActive={currentPath === "/admin/movies" || currentPath.includes("/admin/movies/")}
            onClick={onNavLinkClick}
          />
          <SubMenuItem 
            icon={AiOutlineStar} 
            text="Actors" 
            to="/admin/actors" 
            isActive={currentPath.includes("actors")}
            onClick={onNavLinkClick}
          />
          <SubMenuItem 
            icon={AiOutlineVideoCamera} 
            text="Directors" 
            to="/admin/directors" 
            isActive={currentPath.includes("directors")}
            onClick={onNavLinkClick}
          />
          <SubMenuItem 
            icon={AiOutlineUser} 
            text="Producers" 
            to="/admin/producers" 
            isActive={currentPath.includes("producers")}
            onClick={onNavLinkClick}
          />
        </MenuGroup>

        <MenuGroup 
          id="branches" 
          icon={AiOutlineShop} 
          title="Branches" 
          isCollapsed={isCollapsed}
          isActive={isPathInGroup(["branches", "cinemas", "seat-types", "rooms", "showtimes"])}
        >
          {/* Only admin can see Branches */}
          {isAdmin && (
            <SubMenuItem 
              icon={AiOutlineShop} 
              text="Branches" 
              to="/admin/branches" 
              isActive={currentPath.includes("branches")}
              onClick={onNavLinkClick}
            />
          )}
          <SubMenuItem 
            icon={AiOutlineVideoCamera} 
            text="Cinemas" 
            to="/admin/cinemas" 
            isActive={currentPath.includes("cinemas")}
            onClick={onNavLinkClick}
          />
          {/* Only admin can see Seat Types */}
          {isAdmin && (
            <SubMenuItem 
              icon={AiOutlineStar} 
              text="Seat Types" 
              to="/admin/seat-types" 
              isActive={currentPath.includes("seat-types")}
              onClick={onNavLinkClick}
            />
          )}
          <SubMenuItem 
            icon={AiOutlineVideoCamera} 
            text="Screening Rooms" 
            to="/admin/rooms" 
            isActive={currentPath.includes("rooms")}
            onClick={onNavLinkClick}
          />
          <SubMenuItem 
            icon={AiOutlineBarChart} 
            text="Showtimes" 
            to="/admin/showtimes" 
            isActive={currentPath.includes("showtimes")}
            onClick={onNavLinkClick}
          />
        </MenuGroup>

        <MenuGroup 
          id="food" 
          icon={AiOutlineCoffee} 
          title="Food & Drinks" 
          isCollapsed={isCollapsed}
          isActive={isPathInGroup(["food&drink", "combo"])}
        >
          <SubMenuItem 
            icon={AiOutlineCoffee} 
            text="Individual Items" 
            to="/admin/food&drink" 
            isActive={currentPath.includes("food&drink")}
            onClick={onNavLinkClick}
          />
          <SubMenuItem 
            icon={AiOutlineGift} 
            text="Combos" 
            to="/admin/combo" 
            isActive={currentPath.includes("combo")}
            onClick={onNavLinkClick}
          />
        </MenuGroup>

        <MenuGroup 
          id="promotions" 
          icon={AiOutlinePercentage} 
          title="Promotions" 
          isCollapsed={isCollapsed}
          isActive={isPathInGroup(["promotions"])}
        >
          <SubMenuItem 
            icon={AiOutlinePercentage} 
            text="Discount Codes" 
            to="/admin/promotions" 
            isActive={currentPath.includes("promotions")}
            onClick={onNavLinkClick}
          />
        </MenuGroup>

        <MenuItem 
          icon={AiOutlineShopping} 
          text="Orders" 
          to="orders" 
          isCollapsed={isCollapsed} 
          isActive={currentPath.includes("orders")}
          onClick={onNavLinkClick}
        />

        <MenuItem 
          icon={AiOutlineFileText} 
          text="Blog Posts" 
          to="/admin/posts" 
          isCollapsed={isCollapsed} 
          isActive={currentPath.includes("posts")}
          onClick={onNavLinkClick}
        />
        
        <MenuItem 
          icon={AiOutlineMessage} 
          text="Scan QR" 
          to="/staff/scan-qr" 
          isCollapsed={isCollapsed} 
          isActive={currentPath.includes("scan-qr")}
          onClick={onNavLinkClick}
        />

        <MenuItem 
          icon={AiOutlineSetting} 
          text="Settings" 
          to="/admin/settings" 
          isCollapsed={isCollapsed} 
          isActive={currentPath.includes("settings")}
          onClick={onNavLinkClick}
        />
      </div>
    </nav>
  );
}