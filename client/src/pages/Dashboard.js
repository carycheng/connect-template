import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Spinner, Table } from 'react-bootstrap';
import { Bell, Mailbox, Search, House, ExclamationOctagon, PersonCheck } from 'react-bootstrap-icons';
import axios from 'axios';

import '../public/styles/Dashboard.css';
import dogIcon from '../public/images/dog.png';

class Dashboard extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            accountBalance: null,
            availableBalance: null,
            pendingBalance: null,
            accountId: null,
            accountLinkUrl: null,
            payouts: null,
            accountStatus: "pending",
            loginLinkUrl: null,
            reportingStatePending: false,
            payoutStatePending: false,
            charges: null,
            parsedUser: null,
        };
        this.generateReportHandler = this.generateReportHandler.bind(this);
    }

    componentDidMount() {
        const savedUser = localStorage.getItem('user')
        const parsedUser = JSON.parse(savedUser);

        (async () => {
            await this.setState({parsedUser: parsedUser})
            console.log('Parsed User: ', this.state.parsedUser);

            const payouts = await axios.post('/api/v1/get-payouts', this.state.parsedUser);
            const accountInfo = await axios.post('/api/v1/get-account-info', parsedUser);
            const accountBalance = await axios.post('/api/v1/get-account-balance', parsedUser);
            this.setState({accountId: accountInfo.data.body.id})
            this.setState({payouts: payouts.data})
            console.log('Payouts', this.state.payouts);

            this.setState({accountBalance: accountBalance})
            this.setState({availableBalance: this.state.accountBalance.data.body.available[0].amount})
            this.setState({pendingBalance: this.state.accountBalance.data.body.pending[0].amount})

            if (accountInfo.data.body.charges_enabled == true) {
                this.setState({accountStatus: "verified"});
                const loginLink = await axios.post('/api/v1/get-update-link', parsedUser);
                this.setState({ loginLinkUrl: loginLink.data.body.url });
            }

            if (this.state.accountLinkUrl == null) {
                const response = await axios.post('/api/v1/create-account-link', parsedUser);
                this.setState({accountLinkUrl: response.data.body.url});
            }

            let charges = await axios.post('/api/v1/get-transfers', parsedUser);
            this.setState({charges: charges.data.body})
        })()
    }

    async generateReportHandler(event) {
        event.preventDefault();

        this.setState({reportingStatePending: true})
        const reportObject = await axios.post('/api/v1/generate-report');

        window.location.href = reportObject.data.body.url;
        this.setState({reportingStatePending: false})
    }

    async createPayoutHandler() {
        this.setState({payoutStatePending: true})

        const payoutInfo = {
            accountId: this.state.accountId,
            payoutAmount: this.state.availableBalance
        }
        const payout = await axios.post('/api/v1/create-payout', payoutInfo);
        this.setState({payoutStatePending: false})
        this.setState({availableBalance: 0})

        console.log(this.state.parsedUser);

        const payouts = await axios.post('/api/v1/get-payouts', this.state.parsedUser);
        console.log('Payouts: ', payouts);
        this.setState({payouts: payouts.data})
    }
    
    renderList() {
        if (this.state.charges == null) {
            return null;
        } else {
            return this.state.charges.map(charge => {
                return(<tr>
                    <td>${charge.amount/100}.00</td>
                    <td>${charge.application_fee_amount == null ? 0 : charge.application_fee_amount/100}.00</td>
                    <td>{charge.outcome.risk_level}</td>
                    <td className="risk-score-padding" ><div class={charge.outcome.risk_score < 65 ? "numberCircle" : "numberCircle"}>{charge.outcome.risk_score}</div></td>
                    <td>{charge.outcome.seller_message}</td>
                </tr>);
            });
        }
    }

    renderPayouts() {
        if (this.state.payouts == null) {
            return null;
        } else {
            return this.state.payouts.body.data.map(payout => {
                var date = new Date(payout.arrival_date * 1000)
                console.log('Date: ', date);
                return(<tr>
                    <td>${payout.amount/100}.00</td>
                    <td>{payout.status}</td>
                    <td>{date.toDateString()}</td>
                </tr>);
            });
        }
    }

    render() {
        const accountState = this.state.accountStatus;
        return (
        <div>
        {/* Page Wrapper */}
        <div id="wrapper">
          {/* Sidebar */}
          <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
            {/* Sidebar - Brand */}
            <a className="sidebar-brand d-flex align-items-center justify-content-center" href="index.html">
              <div className="sidebar-brand-icon rotate-n-15">
                <i className="fas fa-laugh-wink" />
              </div>
              <House />
              <div className="sidebar-brand-text mx-3">Home</div>
            </a>
            {/* Divider */}
            <hr className="sidebar-divider my-0" />
            {/* Nav Item - Dashboard */}
            <li className="nav-item">
              <a className="nav-link" href="index.html">
                <i className="fas fa-fw fa-tachometer-alt" />
                <span>Overview</span></a>
            </li>
            {/* Divider */}
            <hr className="sidebar-divider" />
            {/* Heading */}
            <div className="sidebar-heading">
              Dashboard
            </div>
            {/* Nav Item - Pages Collapse Menu */}
            <li className="nav-item active">
              <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                <i className="fas fa-fw fa-cog" />
                <span>Summary</span>
              </a>
            </li>
            {/* Nav Item - Utilities Collapse Menu */}
            <li className="nav-item">
              <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseUtilities" aria-expanded="true" aria-controls="collapseUtilities">
                <i className="fas fa-fw fa-wrench" />
                <span>Settings</span>
              </a>
              <div id="collapseUtilities" className="collapse" aria-labelledby="headingUtilities" data-parent="#accordionSidebar">
                <div className="bg-white py-2 collapse-inner rounded">
                  <h6 className="collapse-header">Custom Utilities:</h6>
                  <a className="collapse-item" href="utilities-color.html">Colors</a>
                  <a className="collapse-item" href="utilities-border.html">Borders</a>
                  <a className="collapse-item" href="utilities-animation.html">Animations</a>
                  <a className="collapse-item" href="utilities-other.html">Other</a>
                </div>
              </div>
            </li>
            {/* Divider */}
            <hr className="sidebar-divider" />
            {/* Heading */}
            <div className="sidebar-heading">
              Additional
            </div>
            {/* Nav Item - Pages Collapse Menu */}
            <li className="nav-item">
              <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapsePages" aria-expanded="true" aria-controls="collapsePages">
                <i className="fas fa-fw fa-folder" />
                <Link to="/product" className="link-styling"><span>Products</span></Link>
              </a>
              <div id="collapsePages" className="collapse" aria-labelledby="headingPages" data-parent="#accordionSidebar">
                <div className="bg-white py-2 collapse-inner rounded">
                  <h6 className="collapse-header">Login Screens:</h6>
                  <a className="collapse-item" href="login.html">Login</a>
                  <a className="collapse-item" href="register.html">Register</a>
                  <a className="collapse-item" href="forgot-password.html">Forgot Password</a>
                  <div className="collapse-divider" />
                  <h6 className="collapse-header">Other Pages:</h6>
                  <a className="collapse-item" href="404.html">404 Page</a>
                  <a className="collapse-item" href="blank.html">Blank Page</a>
                </div>
              </div>
            </li>
            {/* Nav Item - Charts */}
            <li className="nav-item">
              <a className="nav-link" href="charts.html">
                <i className="fas fa-fw fa-chart-area" />
                <span>Reports</span></a>
            </li>
            {/* Nav Item - Tables */}
            <li className="nav-item">
              <a className="nav-link" href="tables.html">
                <i className="fas fa-fw fa-table" />
                <span>Sign Out</span></a>
            </li>
            {/* Divider */}
            <hr className="sidebar-divider d-none d-md-block" />
          </ul>
          {/* End of Sidebar */}
          {/* Content Wrapper */}
          <div id="content-wrapper" className="d-flex flex-column">
            {/* Main Content */}
            <div id="content">
              {/* Topbar */}
              <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
                {/* Sidebar Toggle (Topbar) */}
                <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
                  <i className="fa fa-bars" />
                </button>
                {/* Topbar Search */}
                <form className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
                  <div className="input-group">
                    <input type="text" className="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2" />
                    <div className="input-group-append">
                      <button className="btn btn-primary" type="button">
                        <Search />
                      </button>
                    </div>
                  </div>
                </form>
                {/* Topbar Navbar */}
                <ul className="navbar-nav ml-auto">
                  {/* Nav Item - Search Dropdown (Visible Only XS) */}
                  <li className="nav-item dropdown no-arrow d-sm-none">
                    <a className="nav-link dropdown-toggle" href="#" id="searchDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <i className="fas fa-search fa-fw" />
                    </a>
                    {/* Dropdown - Messages */}
                    <div className="dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in" aria-labelledby="searchDropdown">
                      <form className="form-inline mr-auto w-100 navbar-search">
                        <div className="input-group">
                          <input type="text" className="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2" />
                          <div className="input-group-append">
                            <button className="btn btn-primary" type="button">
                              <i className="fas fa-search fa-sm" />
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </li>
                  {/* Nav Item - Alerts */}
                  <li className="nav-item dropdown no-arrow mx-1">
                    <a className="nav-link dropdown-toggle" href="#" id="alertsDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <Bell size={25}/>
                      {/* Counter - Alerts */}
                      <span className="badge badge-danger badge-counter">3+</span>
                    </a>
                    {/* Dropdown - Alerts */}
                    <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="alertsDropdown">
                      <h6 className="dropdown-header">
                        Alerts Center
                      </h6>
                      <a className="dropdown-item d-flex align-items-center" href="#">
                        <div className="mr-3">
                          <div className="icon-circle bg-primary">
                            <i className="fas fa-file-alt text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="small text-gray-500">December 12, 2019</div>
                          <span className="font-weight-bold">A new monthly report is ready to download!</span>
                        </div>
                      </a>
                      <a className="dropdown-item d-flex align-items-center" href="#">
                        <div className="mr-3">
                          <div className="icon-circle bg-success">
                            <i className="fas fa-donate text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="small text-gray-500">December 7, 2019</div>
                          $290.29 has been deposited into your account!
                        </div>
                      </a>
                      <a className="dropdown-item d-flex align-items-center" href="#">
                        <div className="mr-3">
                          <div className="icon-circle bg-warning">
                            <i className="fas fa-exclamation-triangle text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="small text-gray-500">December 2, 2019</div>
                          Spending Alert: We've noticed unusually high spending for your account.
                        </div>
                      </a>
                      <a className="dropdown-item text-center small text-gray-500" href="#">Show All Alerts</a>
                    </div>
                  </li>
                  {/* Nav Item - Messages */}
                  <li className="nav-item dropdown no-arrow mx-1">
                    <a className="nav-link dropdown-toggle" href="#" id="messagesDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <Mailbox size={28}/>
                      {/* Counter - Messages */}
                      <span className="badge badge-danger badge-counter">7</span>
                    </a>
                    {/* Dropdown - Messages */}
                    <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="messagesDropdown">
                      <h6 className="dropdown-header">
                        Message Center
                      </h6>
                      <a className="dropdown-item d-flex align-items-center" href="#">
                        <div className="dropdown-list-image mr-3">
                          <img className="rounded-circle" src="img/undraw_profile_1.svg" alt="..." />
                          <div className="status-indicator bg-success" />
                        </div>
                        <div className="font-weight-bold">
                          <div className="text-truncate">Hi there! I am wondering if you can help me with a
                            problem I've been having.</div>
                          <div className="small text-gray-500">Emily Fowler ?? 58m</div>
                        </div>
                      </a>
                      <a className="dropdown-item d-flex align-items-center" href="#">
                        <div className="dropdown-list-image mr-3">
                          <img className="rounded-circle" src="img/undraw_profile_2.svg" alt="..." />
                          <div className="status-indicator" />
                        </div>
                        <div>
                          <div className="text-truncate">I have the photos that you ordered last month, how
                            would you like them sent to you?</div>
                          <div className="small text-gray-500">Jae Chun ?? 1d</div>
                        </div>
                      </a>
                      <a className="dropdown-item d-flex align-items-center" href="#">
                        <div className="dropdown-list-image mr-3">
                          <img className="rounded-circle" src="img/undraw_profile_3.svg" alt="..." />
                          <div className="status-indicator bg-warning" />
                        </div>
                        <div>
                          <div className="text-truncate">Last month's report looks great, I am very happy with
                            the progress so far, keep up the good work!</div>
                          <div className="small text-gray-500">Morgan Alvarez ?? 2d</div>
                        </div>
                      </a>
                      <a className="dropdown-item d-flex align-items-center" href="#">
                        <div className="dropdown-list-image mr-3">
                          <img className="rounded-circle" src="https://source.unsplash.com/Mv9hjnEUHR4/60x60" alt="..." />
                          <div className="status-indicator bg-success" />
                        </div>
                        <div>
                          <div className="text-truncate">Am I a good boy? The reason I ask is because someone
                            told me that people say this to all dogs, even if they aren't good...</div>
                          <div className="small text-gray-500">Chicken the Dog ?? 2w</div>
                        </div>
                      </a>
                      <a className="dropdown-item text-center small text-gray-500" href="#">Read More Messages</a>
                    </div>
                  </li>
                  <div className="topbar-divider d-none d-sm-block" />
                  {/* Nav Item - User Information */}
                  <li className="nav-item dropdown no-arrow">
                    <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <span className="mr-2 d-none d-lg-inline text-gray-600 small">Admin User</span>
                      <img className="img-profile rounded-circle" src={dogIcon} />
                    </a>
                    {/* Dropdown - User Information */}
                    <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                      <a className="dropdown-item" href="#">
                        <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400" />
                        Profile
                      </a>
                      <a className="dropdown-item" href="#">
                        <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400" />
                        Settings
                      </a>
                      <a className="dropdown-item" href="#">
                        <i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400" />
                        Activity Log
                      </a>
                      <div className="dropdown-divider" />
                      <a className="dropdown-item" href="#" data-toggle="modal" data-target="#logoutModal">
                        <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400" />
                        Logout
                      </a>
                    </div>
                  </li>
                </ul>
              </nav>
              {/* End of Topbar */}
              {/* Begin Page Content */}
              <div className="container-fluid dashboard-style">
                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                  <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
                  {this.state.payoutStatePending == true ? (  
                    <a href="#" onClick={this.createPayoutHandler.bind(this)} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm disabled pending-report-btn payout-button-style"><Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" /><i className="fas fa-download fa-sm text-white-50 pending-loader-spacing" />Loading...</a>) :
                    this.state.availableBalance == 0 ? (<a href="#" onClick={this.createPayoutHandler.bind(this)} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm payout-button-style disabled"><i className="fas fa-download fa-sm text-white-50" />Payout Account</a>) : (<a href="#" onClick={this.createPayoutHandler.bind(this)} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm payout-button-style"><i className="fas fa-download fa-sm text-white-50" />Payout Account</a>)}
                  {this.state.reportingStatePending == true ? (  
                    <a href="#" onClick={this.generateReportHandler} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm disabled pending-report-btn"><Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" /><i className="fas fa-download fa-sm text-white-50 pending-loader-spacing" />Loading...</a>) :
                    (<a href="#" onClick={this.generateReportHandler} className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i className="fas fa-download fa-sm text-white-50" />Generate Report</a>)}
                </div>
                {/* Content Row */}
                <div className="row">
                  {/* Earnings (Monthly) Card Example */}
                  <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-primary shadow h-100 py-2">
                      <div className="card-body">
                        <div className="row no-gutters align-items-center">
                          <div className="col mr-2">
                            <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                              Available Balance </div>
                            <div className="h5 mb-0 font-weight-bold text-gray-800">${this.state.accountBalance == null ? 0 : this.state.availableBalance/100}.00</div>
                          </div>
                          <div className="col-auto">
                            <i className="fas fa-calendar fa-2x text-gray-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Earnings (Monthly) Card Example */}
                  <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-success shadow h-100 py-2">
                      <div className="card-body">
                        <div className="row no-gutters align-items-center">
                          <div className="col mr-2">
                            <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                              Pending Balance</div>
                            <div className="h5 mb-0 font-weight-bold text-gray-800">${this.state.accountBalance == null ? 0 : this.state.pendingBalance/100}.00</div>
                          </div>
                          <div className="col-auto">
                            <i className="fas fa-dollar-sign fa-2x text-gray-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Earnings (Monthly) Card Example */}
                  <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-info shadow h-100 py-2">
                      <div className="card-body">
                        <div className="row no-gutters align-items-center">
                          <div className="col mr-2">
                            <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Tasks
                            </div>
                            <div className="row no-gutters align-items-center">
                              <div className="col-auto">
                                { accountState == "pending" ? (<div className="h5 mb-0 mr-3 font-weight-bold text-gray-800">50%</div>) : 
                                    (<div className="h5 mb-0 mr-3 font-weight-bold text-gray-800">100%</div>)
                                }
                              </div>
                              <div className="col">
                                <div className="progress progress-sm mr-2">
                                  <div className="progress-bar bg-info" role="progressbar" style={accountState == "pending" ? {width: '50%'} : {width: '100%'}} aria-valuenow={50} aria-valuemin={0} aria-valuemax={100} />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-auto">
                            <i className="fas fa-clipboard-list fa-2x text-gray-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Pending Requests Card Example */}
                  <div className="col-xl-3 col-md-6 mb-4">
                    <div className={(accountState == "pending") ? "card border-left-pending shadow h-100 py-2": "card border-left-success shadow h-100 py-2"}>
                      <div className="card-body">
                        <div className="row no-gutters align-items-center">
                          <div className="col mr-2">
                            { accountState == "pending" ?
                            (<div><div className="text-xs font-weight-bold text-pending text-uppercase mb-1">
                              Account Status</div>
                              <div class="pending-color">
                                <ExclamationOctagon className="pending-icon" />
                                <a href={this.state.accountLinkUrl} className="mb-0 font-weight-bold pending-section-font-size pending-color">Please finish onboarding</a>
                              </div></div>) : (
                                <div><div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                    Account Status</div>
                                    <div class="verified-color">
                                    <PersonCheck className="pending-icon" />
                                    <a href={this.state.loginLinkUrl} target="_blank" className="mb-0 font-weight-bold verified-section-font-size verified-color">Account Verified</a>
                                </div></div>
                              )
                            }
                            </div>
                          <div className="col-auto">
                            <i className="fas fa-comments fa-2x text-gray-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Content Row */}
                <div className="row">
                  {/* Area Chart */}
                  <div className="col-xl-8 col-lg-7">
                    <div className="card shadow mb-4">
                      {/* Card Header - Dropdown */}
                      <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 className="m-0 font-weight-bold text-primary">Earnings Overview</h6>
                        <div className="dropdown no-arrow">
                          <a className="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-ellipsis-v fa-sm fa-fw text-gray-400" />
                          </a>
                          <div className="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink">
                            <div className="dropdown-header">Dropdown Header:</div>
                            <a className="dropdown-item" href="#">Action</a>
                            <a className="dropdown-item" href="#">Another action</a>
                            <div className="dropdown-divider" />
                            <a className="dropdown-item" href="#">Something else here</a>
                          </div>
                        </div>
                      </div>
                      {/* Card Body */}
                      <div className="card-body">
                        <div className="chart-area">
                        <Table borderless responsive="sm">
                            <thead>
                            <tr>
                                <th>Payment</th>
                                <th>Fee</th>
                                <th>Risk Level</th>
                                <th>Risk Score</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                                { this.renderList() }
                            </tbody>
                        </Table>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Pie Chart */}
                  <div className="col-xl-4 col-lg-5">
                    <div className="card shadow mb-4">
                      {/* Card Header - Dropdown */}
                      <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 className="m-0 font-weight-bold text-primary">Payouts Overview</h6>
                        <div className="dropdown no-arrow">
                          <a className="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-ellipsis-v fa-sm fa-fw text-gray-400" />
                          </a>
                          <div className="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink">
                            <div className="dropdown-header">Dropdown Header:</div>
                            <a className="dropdown-item" href="#">Action</a>
                            <a className="dropdown-item" href="#">Another action</a>
                            <div className="dropdown-divider" />
                            <a className="dropdown-item" href="#">Something else here</a>
                          </div>
                        </div>
                      </div>
                      {/* Card Body */}
                      <div className="card-body">
                      <Table borderless responsive="sm">
                            <thead>
                            <tr>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Arrival Date</th>
                            </tr>
                            </thead>
                            <tbody>
                                { this.renderPayouts() }
                            </tbody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /.container-fluid */}
            </div>
            {/* End of Main Content */}
            {/* Footer */}
            <footer className="sticky-footer bg-white">
              <div className="container my-auto">
                <div className="copyright text-center my-auto">
                  <span>Copyright ?? Your Website 2021</span>
                </div>
              </div>
            </footer>
            {/* End of Footer */}
          </div>
          {/* End of Content Wrapper */}
        </div>
        {/* End of Page Wrapper */}
        {/* Scroll to Top Button*/}
        <a className="scroll-to-top rounded" href="#page-top">
          <i className="fas fa-angle-up" />
        </a>
      </div>
        );
    }
}

const mapStateToProps = (state) => {
    return { user: state.user }
};

export default connect(mapStateToProps, null)(Dashboard);