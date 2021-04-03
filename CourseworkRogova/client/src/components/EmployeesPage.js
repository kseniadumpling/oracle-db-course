import React, { Component } from 'react';
import { Modal, Button, Form, Col, Alert} from 'react-bootstrap';
import Nav from './nav';
import _ from 'lodash';
import fileDownload from 'js-file-download';


class EmployeesPage extends Component {
    constructor() {
        super();
        this.state = {
            employees: [],
            showCreate: false,
            showModify: false,
            showDelete: false,

            showSuccessMessage: false,
            showFailedMessage: false,
            error: '',

            firstName: '',
            patherName: '',
            lastName: '',
            position: '',
            salary: null,
            selectedEmployee: null
        }
    }

    handleErrors(response) {
        if (!response.ok) {
            throw Error(response);
        }
        return response;
    }

    onCreate() {
        this.setState({
            showCreate: true,
            showFailedMessage: false,
            showSuccessMessage: false
        });
    }

    onDelete(id) {
        this.setState({
            showDelete: true,
            showFailedMessage: false,
            showSuccessMessage: false,
            selectedEmployee: id
        });
    }

    onModify(id) {
        this.setState({
            showModify: true,
            showFailedMessage: false,
            showSuccessMessage: false,
            selectedEmployee: id
        })
    }

    onDownload() {
        const {employees} = this.state;

        fileDownload(JSON.stringify(employees), 'employees.json');
    }

    hideModals() {
        this.setState({
            showCreate: false,
            showDelete: false,
            showModify: false,

            firstName: '',
            patherName: '',
            lastName: '',
            position: '',
            salary: null,
            selectedEmployee: null
        });
    }

    hideMessages() {
        this.setState({
            showFailedMessage: false,
            showSuccessMessage: false
        })
    }

    handleFormChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    onSubmitCreate() {
        const {firstName, patherName, lastName, position, salary} = this.state;
        const body = {
            firstName: firstName,
            patherName: patherName,
            lastName: lastName,
            position: position,
            salary: salary
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // dunno that is it
            body: JSON.stringify(body)
        };


        fetch('/api/employees/create', requestOptions)
            .then(response => this.handleErrors(response))
            .then(response => response.json())
            .then(response => this.setState({ showSuccessMessage: response === 1}))
            .catch(error => this.setState({ error, showFailedMessage: true }))
            .then(() => {
                fetch('/api/employees')
                    .then(res => res.json())
                    .then(employees => this.setState({ employees }));
            })

        this.hideModals();
    }

    onSubmitModify() {
        const {firstName, patherName, lastName, position, salary, selectedEmployee, employees} = this.state;
        const values = _.find(employees, employee => employee.ID === selectedEmployee);
        const body = {
            firstName: firstName === '' ? values.FIRST_NAME : firstName,
            patherName: patherName === '' ? values.PATHER_NAME : patherName,
            lastName: lastName === '' ? values.LAST_NAME : lastName,
            position: position === '' ? values.POSITION : position,
            salary: salary == null ? values.SALARY : salary, 
            id: selectedEmployee
        }

        console.log(values.SALARY)
        console.log(salary)
        console.log(body.salary);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };


        fetch(`/api/employees/${selectedEmployee}/modify`, requestOptions)
            .then(response => this.handleErrors(response))
            .then(response => response.json())
            .then(response => this.setState({ showSuccessMessage: response === 1}))
            .catch(error => this.setState({ error, showFailedMessage: true }))
            .then(() => {
                fetch('/api/employees')
                    .then(res => res.json())
                    .then(employees => this.setState({ employees }));
            })

        this.hideModals();
    }

    onSubmitDelete() {
        const {selectedEmployee} = this.state;
        const body = {id: selectedEmployee}

        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };


        fetch(`/api/employees/${selectedEmployee}/delete`, requestOptions)
            .then(response => this.handleErrors(response))
            .then(response => response.json())
            .then(response => this.setState({ showSuccessMessage: response === 1}))
            .catch(error => this.setState({ error, showFailedMessage: false }))
            .then(() => {
                fetch('/api/employees')
                    .then(res => res.json())
                    .then(employees => this.setState({ employees }));
            })

        this.hideModals();
    }

    renderCreateModal() {
        const { showCreate } = this.state;
        return (
            <Modal show={showCreate} size="lg" onHide={() => this.hideModals()}>
                <Modal.Header>
                    <Modal.Title>Hire new employee</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>First name</Form.Label>
                            <Form.Control type="text" name="firstName" placeholder="Enter first name" onChange={(e) => this.handleFormChange(e)} required/>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Pather name</Form.Label>
                            <Form.Control type="text" name="patherName" placeholder="Enter pather name" onChange={(e) => this.handleFormChange(e)} />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Last name</Form.Label>
                            <Form.Control type="text" name="lastName" placeholder="Enter last name" onChange={(e) => this.handleFormChange(e)} required/>
                        </Form.Group>

                        <Form.Row>
                            <Form.Group as={Col} md="8">
                                <Form.Label>Position</Form.Label>
                                <Form.Control type="text" name="position" placeholder="Enter position" onChange={(e) => this.handleFormChange(e)} required/>
                            </Form.Group>

                            <Form.Group as={Col} md="4">
                                <Form.Label>Salary</Form.Label>
                                <Form.Control type="number" min="0" name="salary" onChange={(e) => this.handleFormChange(e)} required/>
                            </Form.Group>
                        </Form.Row>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => this.hideModals()}>Close</Button>
                    <Button variant="info" type="submit" onClick={() => this.onSubmitCreate()} >Add</Button>
                </Modal.Footer>
            </Modal>
        );

    }

    renderDeleteModal() {
        const { showDelete, employees, selectedEmployee} = this.state;
        const values = _.find(employees, employee => employee.ID === selectedEmployee);
        return (
            <Modal show={showDelete} size="md" onHide={() => this.hideModals()}>
                <Modal.Header>
                    <Modal.Title>Fire employee</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>{`Are you sure you want to fire ${values.FIRST_NAME} ${values.PATHER_NAME} ${values.LAST_NAME}, employeeID: ${values.ID}?`}</p>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => this.hideModals()}>Close</Button>
                    <Button variant="info" type="submit" onClick={() => this.onSubmitDelete()} >Fire</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    renderModifyModal() {
        const { showModify, employees, selectedEmployee} = this.state;
        const values = _.find(employees, employee => employee.ID === selectedEmployee);
        return (
            <Modal show={showModify} size="lg" onHide={() => this.hideModals()}>
                <Modal.Header>
                    <Modal.Title>Update employee info</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>First name</Form.Label>
                            <Form.Control type="text" defaultValue={values.FIRST_NAME} name="firstName" placeholder="Enter first name" onChange={(e) => this.handleFormChange(e)} required/>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Pather name</Form.Label>
                            <Form.Control type="text" defaultValue={values.PATHER_NAME} name="patherName" placeholder="Enter pather name" onChange={(e) => this.handleFormChange(e)} />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Last name</Form.Label>
                            <Form.Control type="text" defaultValue={values.LAST_NAME} name="lastName" placeholder="Enter last name" onChange={(e) => this.handleFormChange(e)} required/>
                        </Form.Group>

                        <Form.Row>
                            <Form.Group as={Col} md="8">
                                <Form.Label>Position</Form.Label>
                                <Form.Control type="text" defaultValue={values.POSITION} name="position" placeholder="Enter position" onChange={(e) => this.handleFormChange(e)} required/>
                            </Form.Group>

                            <Form.Group as={Col} md="4">
                                <Form.Label>Salary</Form.Label>
                                <Form.Control type="number" min="0" defaultValue={values.SALARY} name="salary" onChange={(e) => this.handleFormChange(e)} required/>
                            </Form.Group>
                        </Form.Row>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => this.hideModals()}>Close</Button>
                    <Button variant="info" type="submit" onClick={() => this.onSubmitModify()} >Update</Button>
                </Modal.Footer>
            </Modal>
        );

    }

    renderTableRows() {
        const { employees } = this.state;
        const tableRows = employees.map(employee => {
            return (
                <tr key={employee.ID}>
                    <th>{employee.ID}</th>
                    <th>{employee.FIRST_NAME}</th>
                    <th>{employee.PATHER_NAME}</th>
                    <th>{employee.LAST_NAME}</th>
                    <th>{employee.POSITION}</th>
                    <th>{employee.SALARY}</th>
                    <th>
                        <button type="button" className="btn btn-outline-info btn-sm mx-2" onClick={() => this.onDelete(employee.ID)}>delete</button>
                        <button type="button" className="btn btn-outline-info btn-sm " onClick={() => this.onModify(employee.ID)}>modify</button>
                    </th>
                </tr>
            )
        });

        return tableRows;
    }

    renderFailedMessage() {
        const {error} = this.state;

        return (
            <Alert variant="danger" onClose={() => this.hideMessages()} dismissible>
                {`Operation denied: ${error}`}
            </Alert>
        );
    }

    renderSuccessMessage() {
        return (
            <Alert variant="success" onClose={() => this.hideMessages()} dismissible>
                Operation finished successfully! 
            </Alert>
        );
    }

    componentDidMount() {
        fetch('/api/employees')
            .then(res => res.json())
            .then(employees => this.setState({ employees }));
    };

    render() {
        const { showCreate, showDelete, showModify, showFailedMessage, showSuccessMessage} = this.state;

        return (
            <div className="row">               
                <Nav />
                <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-5 p-4">
                    <h2 className="pt-4">Employees</h2>

                    {showSuccessMessage ? this.renderSuccessMessage() : null}
                    {showFailedMessage ? this.renderFailedMessage() : null}

                    <button type="button" className="btn btn-outline-info my-3" onClick={() => this.onCreate()}>Add new employee</button>
                    <button type="button" className="btn btn-outline-info my-3 float-right" onClick={() => this.onDownload()}>Export</button>

                    <div className="table-responsive">
                        <table className="table table-sm table-bordered table-hover">
                            <thead>
                                <tr className="table-info">
                                    <th className="bold">ID</th>
                                    <th className="bold">First Name</th>
                                    <th className="bold">Pather Name</th>
                                    <th className="bold">Last Name</th>
                                    <th className="bold">Position</th>
                                    <th className="bold">Salary</th>
                                    <th className="bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderTableRows()}
                            </tbody>
                        </table>
                    </div>

                    {showCreate ? this.renderCreateModal() : null}
                    {showDelete ? this.renderDeleteModal() : null}
                    {showModify ? this.renderModifyModal() : null}
                </main>
            </div>
        )
    }
}

export default EmployeesPage;
