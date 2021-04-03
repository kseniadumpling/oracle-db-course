import React from 'react';
import { Link } from 'react-router-dom';
//import './nav.css';

function Nav(props) {
    return (
        <nav id="sidebarMenu" className="col-md-2 col-lg-2 d-md-block bg-light sidebar collapse">
            <div className="sidebar-sticky pt-3">
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <Link to="/projects" className="nav-link"><span data-feather="file"></span>Projects</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/departments" className="nav-link"><span data-feather="home"></span>Departments</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/employees" className="nav-link"><span data-feather="users"></span>Employees</Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}


export default Nav;