import React, { Component } from 'react';
import { Modal, Button, Form, Alert} from 'react-bootstrap';
import Nav from './nav';
import _ from 'lodash';
import fileDownload from 'js-file-download';


class DepartmentsPage extends Component {
    constructor() {
        super();
        this.state = {
            departments: [],
            depEmpl: [],
            employees: [],
            showCreate: false,
            showModify: false,
            showAddEmployee: false,
            showDepartmentDelete: false,
            showEmployeeDelete: false,

            showSuccessMessage: false,
            showFailedMessage: false,
            error: '',

            departmentName: '',
            selectedDepartment: null,
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

    onDepartmentDelete(id) {
        if (id) {
            this.setState({
                showDepartmentDelete: true,
                showFailedMessage: false,
                showSuccessMessage: false,
                selectedDepartment: id
            });
        } else {
            this.setState({
                showDepartmentDelete: false,
                showFailedMessage: false,
                showSuccessMessage: false,
                selectedDepartment: null
            })
        }
    }

    onEmployeeDelete(id) {
        this.setState({
            showEmployeeDelete: true,
            showFailedMessage: false,
            showSuccessMessage: false,
            selectedEmployee: id
        });
    }

    onModify(id) {
        if (id) {
            this.setState({
                showModify: true,
                showFailedMessage: false,
                showSuccessMessage: false,
                selectedDepartment: id
            })
        } else {
            this.setState({
                showModify: false,
                showFailedMessage: false,
                showSuccessMessage: false,
                selectedDepartment: null
            })
        }
    }

    onAddEmployee(id) {
        if (id) {
            this.setState({
                showAddEmployee: true,
                showFailedMessage: false,
                showSuccessMessage: false,
                selectedDepartment: id
            })
        } else {
            this.setState({
                showAddEmployee: false,
                showFailedMessage: false,
                showSuccessMessage: false,
                selectedDepartment: null
            })
        }
    }

    onDownload() {
        const {departments} = this.state;

        fileDownload(JSON.stringify(departments), 'departments.json');
    }

    hideModals() {
        this.setState({
            showCreate: false,
            showDepartmentDelete: false,
            showEmployeeDelete: false,
            showModify: false,
            showAddEmployee: false,

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
        const {departmentName} = this.state;
        const body = {name: departmentName};

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };


        fetch('/api/departments/create', requestOptions)
            .then(response => this.handleErrors(response))
            .then(response => response.json())
            .then(response => this.setState({ showSuccessMessage: response === 1}))
            .catch(error => this.setState({ error, showFailedMessage: true }))
            .then(() => {
                fetch('/api/departments')
                    .then(res => res.json())
                    .then(departments => this.setState({ departments }));
            })

        this.hideModals();
    }

    onSubmitModify() {
        const {departments, departmentName, selectedDepartment, selectedEmployee} = this.state;
        const values = _.find(departments, department => department.ID == selectedDepartment);
        const body = {
            name: departmentName === '' ? values.NAME : departmentName,
            departmentID: selectedDepartment
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };


        fetch(`/api/departments/${selectedDepartment}/modify`, requestOptions)
            .then(response => this.handleErrors(response))
            .then(response => response.json())
            .then(response => this.setState({ showSuccessMessage: response === 1}))
            .catch(error => this.setState({ error, showFailedMessage: true }))
            .then(() => {
                fetch('/api/departments')
                    .then(res => res.json())
                    .then(departments => this.setState({ departments }));

                fetch('/api/departments_employees')
                    .then(res => res.json())
                    .then(depEmpl => this.setState({depEmpl}));
            })

        this.hideModals();
    }

    onSubmitAddEmployee() {
        const {selectedDepartment, selectedEmployee} = this.state;
        const body = {
            departmentID: selectedDepartment, 
            employeeID: selectedEmployee
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };


        fetch(`/api/departments_employees/modify`, requestOptions)
            .then(response => this.handleErrors(response))
            .then(response => response.json())
            .then(response => this.setState({ showSuccessMessage: response === 1}))
            .catch(error => this.setState({ error, showFailedMessage: true }))
            .then(() => {
                fetch('/api/departments')
                    .then(res => res.json())
                    .then(departments => this.setState({ departments }));

                fetch('/api/departments_employees')
                    .then(res => res.json())
                    .then(depEmpl => this.setState({depEmpl}));
            })

        this.hideModals();
    }

    onSubmitDepartmentDelete() {
        const {selectedDepartment} = this.state;
        const body = {id: selectedDepartment}

        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };

        fetch(`/api/departments/${selectedDepartment}/delete`, requestOptions)
            .then(response => this.handleErrors(response))
            .then(response => response.json())
            .then(response => this.setState({ showSuccessMessage: response === 1}))
            .catch(error => this.setState({ error, showFailedMessage: false }))
            .then(() => {
                fetch('/api/departments')
                    .then(res => res.json())
                    .then(departments => this.setState({ departments }));
            })

        this.hideModals();
    }

    onSubmitEmployeeDelete() {
        const {selectedDepartment, selectedEmployee} = this.state;
        const body = {
            departmentID: selectedDepartment,
            employeeID: selectedEmployee
        }

        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };

        fetch(`/api/departments_employees/delete`, requestOptions)
            .then(response => this.handleErrors(response))
            .then(response => response.json())
            .then(response => this.setState({ showSuccessMessage: response === 1}))
            .catch(error => this.setState({ error, showFailedMessage: false }))
            .then(() => {
                fetch('/api/department_employees')
                    .then(res => res.json())
                    .then(depEmpl => this.setState({depEmpl}));
            })

        this.hideModals();
    }

    renderCreateModal() {
        const { showCreate } = this.state;
        return (
            <Modal show={showCreate} size="lg" onHide={() => this.hideModals()}>
                <Modal.Header>
                    <Modal.Title>Create new department</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Department name</Form.Label>
                            <Form.Control type="text" name="departmentName" placeholder="Enter department name" onChange={(e) => this.handleFormChange(e)} required/>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => this.hideModals()}>Close</Button>
                    <Button variant="info" type="submit" onClick={() => this.onSubmitCreate()} >Create</Button>
                </Modal.Footer>
            </Modal>
        );

    }

    renderDepartmentDeleteModal() {
        const {showDepartmentDelete, departments, selectedDepartment} = this.state;

        const values = _.find(departments, department => department.ID == selectedDepartment);
        return (
            <Modal show={showDepartmentDelete} size="md" onHide={() => this.hideModals()}>
                <Modal.Header>
                    <Modal.Title>Remove department</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>{`Are you sure you want to delete ${values.NAME}?`}</p>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => this.hideModals()}>Close</Button>
                    <Button variant="info" type="submit" onClick={() => this.onSubmitDepartmentDelete()} >Delete</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    renderEmployeeDeleteModal() {
        const {showEmployeeDelete, departments, selectedDepartment, employees, selectedEmployee} = this.state;

        const depValues = _.find(departments, department => department.ID == selectedDepartment);
        const empValues = _.find(employees, employee => employee.ID == selectedEmployee);
        return (
            <Modal show={showEmployeeDelete} size="md" onHide={() => this.hideModals()}>
                <Modal.Header>
                    <Modal.Title>Remove employee from department</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>{`Are you sure you want to remove ${empValues.FIRST_NAME} ${empValues.LAST_NAME} from ${depValues.NAME}?`}</p>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => this.hideModals()}>Close</Button>
                    <Button variant="info" type="submit" onClick={() => this.onSubmitEmployeeDelete()} >Remove</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    renderModifyModal() {
        const {showModify, employees, departments, selectedDepartment} = this.state;

        const values = _.find(departments, department => department.ID == selectedDepartment);
        return (
            <Modal show={showModify} size="lg" onHide={() => this.hideModals()}>
                <Modal.Header>
                    <Modal.Title>Update department</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Department name</Form.Label>
                            <Form.Control type="text" defaultValue={values.NAME} name="departmentName" placeholder="Enter department name" onChange={(e) => this.handleFormChange(e)} required/>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => this.hideModals()}>Close</Button>
                    <Button variant="info" type="submit" onClick={() => this.onSubmitModify()} >Update</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    renderAddEmployeeModal() {
        const {showAddEmployee, employees, departments, selectedDepartment} = this.state;

        const values = _.find(departments, department => department.ID == selectedDepartment);
        return (
            <Modal show={showAddEmployee} size="lg" onHide={() => this.hideModals()}>
                <Modal.Header>
                    <Modal.Title>Add employee to department</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>{`Department name: ${values.NAME}`}</p>
                    <Form>
                        <Form.Group>
                            <Form.Label>Employees</Form.Label>
                            <Form.Control as="select" defaultValue={selectedDepartment} name="selectedEmployee" onChange={(e) => this.handleFormChange(e)}>
                                <option>Choose...</option>
                                {_.map(employees, employee => <option value={employee.ID}>{`${employee.ID}: ${employee.FIRST_NAME} ${employee.LAST_NAME}`}</option>)}
                            </Form.Control>
                        </Form.Group>

                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => this.hideModals()}>Close</Button>
                    <Button variant="info" type="submit" onClick={() => this.onSubmitAddEmployee()} >Add</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    renderTableRows() {
        const { employees, depEmpl, selectedDepartment } = this.state;
        const depEmplByDepID = _.filter(depEmpl, row => row.DEPARTMENT_ID == selectedDepartment);
        const emplIDinDep = _.map(depEmplByDepID, 'EMPLOYEE_ID');
        const emplInDepartment = _.filter(employees, employee => _.includes(emplIDinDep, employee.ID));
        const tableRows = _.map(emplInDepartment, employee => {
            return (
                <tr key={employee.ID}>
                    <th>{employee.ID}</th>
                    <th>{employee.FIRST_NAME}</th>
                    <th>{employee.LAST_NAME}</th>
                    <th>{employee.POSITION}</th>
                    <th>
                        <button type="button" className="btn btn-outline-info btn-sm mx-2" onClick={() => this.onEmployeeDelete(employee.ID)}>delete</button>
                    </th>
                </tr>
            )
        });
        const emptyRows = (
            <tr key="emptyRow">
                <th colSpan="5" className="text-center">No employees found for that department</th>
            </tr>
        )

        return !_.isEmpty(tableRows) ? tableRows : emptyRows;
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

        fetch('/api/departments_employees')
            .then(res => res.json())
            .then(depEmpl => this.setState({depEmpl}));

        fetch('/api/departments')
                .then(res => res.json())
                .then(departments => this.setState({ departments }));
    };

    render() {
        const { departments, selectedDepartment, showCreate, showAddEmployee, showDepartmentDelete, showEmployeeDelete, showModify, showFailedMessage, showSuccessMessage} = this.state;

        return (
            <div className="row">               
                <Nav />
                <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-5 p-4">
                    <h2 className="pt-4">Departments</h2>

                    {showSuccessMessage ? this.renderSuccessMessage() : null}
                    {showFailedMessage ? this.renderFailedMessage() : null}
                    
                    <button type="button" className="btn btn-outline-info my-3" onClick={() => this.onCreate()}>Add new department</button>
                    <button type="button" className="btn btn-outline-info ml-3" onClick={() => this.onDepartmentDelete(selectedDepartment)}>Delete department</button>
                    <button type="button" className="btn btn-outline-info ml-3" onClick={() => this.onModify(selectedDepartment)}>Modify department</button>
                    <button type="button" className="btn btn-outline-info ml-3" onClick={() => this.onAddEmployee(selectedDepartment)}>Add employee</button>
                    <button type="button" className="btn btn-outline-info my-3 float-right" onClick={() => this.onDownload()}>Export</button>

                    <Form.Group>
                        <Form.Control as="select" name="selectedDepartment" onChange={(e) => this.handleFormChange(e)}>
                            <option value={null}>Choose...</option>
                            {_.map(departments, department => <option value={department.ID}>{department.NAME}</option>)}
                        </Form.Control>
                    </Form.Group>

                    <div className="table-responsive">
                        <table className="table table-sm table-bordered table-hover">
                            <thead>
                                <tr className="table-info">
                                    <th className="bold">ID</th>
                                    <th className="bold">First Name</th>
                                    <th className="bold">Last Name</th>
                                    <th className="bold">Position</th>
                                    <th className="bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderTableRows()}
                            </tbody>
                        </table>
                    </div>

                    {showCreate ? this.renderCreateModal() : null}
                    {showDepartmentDelete ? this.renderDepartmentDeleteModal() : null}
                    {showEmployeeDelete ? this.renderEmployeeDeleteModal() : null}
                    {showModify ? this.renderModifyModal() : null}
                    {showAddEmployee ? this.renderAddEmployeeModal() : null}
                </main>
            </div>
        )
    }
}

export default DepartmentsPage;
