import React, { Component } from "react";
import {Alert} from 'react-bootstrap';
import {withRouter} from "react-router";
import sha256 from 'crypto-js/sha256';
import enc_hex from 'crypto-js/enc-hex';


const SALT = 'salty_string';

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            response: [],
            login: '',
            password: '',
            error: '',
            showPages: false
        }
    }

    handleLoginChange = e => {
        this.setState({
            login: e.target.value
        });
    }

    handlePasswordChange= e =>  {
        this.setState({
            password: e.target.value
        });
     }

    handleErrors(response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }
    
    handleSubmit() {
        const {history} = this.props
        const {login, password} = this.state;
        const hashedPassword = sha256(password + SALT).toString(enc_hex);
        const body = {
            login: login,
            password: hashedPassword,
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // dunno that is it
            body: JSON.stringify(body)
        };

        fetch('/api/login', requestOptions)
            .then(response => this.handleErrors(response))
            .then(response => response.json())
            .then(response => {
                console.log(response)
                this.setState({ showPages: response[0].RESULT === 1})
            })
            //.then(response => { response.RESULT === 1 ? history.push('/projects') : null})
            .catch(error => this.setState({ error }) )
    }
    
    renderLoginPage() {
        const {login, password} = this.state;

        return (
            <div  className="col-12 px-5 p-4">
                <div className="row justify-content-center pt-5">
                    <div className="col-6 text-center pt-5">
                        <form className="form-signin">
                            <h1 className="h3 mb-3 font-weight-normal">Please sign in</h1>
                            <label htmlFor="inputLogin" className="sr-only">Login</label>
                            <input type="text" id="inputLogin" className="form-control my-2" placeholder="Login" value={login} onChange={(e) => this.handleLoginChange(e)} required autoFocus />
                            <label htmlFor="inputPassword" className="sr-only">Password</label>
                            <input type="password" id="inputPassword" className="form-control my-2" placeholder="Password" value={password} onChange={(e) => this.handlePasswordChange(e)} required />
                                        
                            <button className="btn  btn-info btn-block" onClick={() => this.handleSubmit()}>Sign in</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    renderErrorMessage() {
        const {error} = this.state;
        
        return (
            <Alert variant="danger" onClose={() => this.hideMessages()} dismissible>
                {`ERROR: ${error} Login or password are wrong.`}
            </Alert>
        );
    }

    render() {
        const {showPages, error} = this.state;
        return (
            <div className="container">
                <div className="row p-5">
                    {error && this.renderErrorMessage()}
                </div>
                {!showPages && this.renderLoginPage() }
                {/*showPages && <Redirect to="/projects" />*/}
            </div>
        )

    }
}

export default withRouter(LoginPage);