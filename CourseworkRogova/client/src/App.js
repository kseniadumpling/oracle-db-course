import React, { Component } from 'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';
import EmployeesPage from './components/EmployeesPage';
import ProjectsPage from './components/ProjectsPage';
import DepartmentsPage from './components/DepartmentsPage';
import LoginPage from './components/LoginPage';


class App extends Component {
    render() {
        return (
            <div className="App">
                <Router>
                    <Route exact path="/" component={LoginPage} />
                    <Route exact path="/projects" component={ProjectsPage} />
                    <Route exact path="/employees" component={EmployeesPage} />
                    <Route exact path="/departments" component={DepartmentsPage} />
                </Router>
            </div>
        );
    }
}

export default App;
