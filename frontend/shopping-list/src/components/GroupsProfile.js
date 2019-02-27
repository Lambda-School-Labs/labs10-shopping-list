import React, { Component } from 'react';
import {checkEmail, getSingleGroup, addGroup, gettingGroups, addItem, getItems, updateItemPurchesd, submitPaidItems } from '../store/actions/rootActions';
import {connect} from 'react-redux';
import "./Styles/Group.css";
import "./Styles/Scrollbar.css";
import {
    MDBListGroup,
    MDBListGroupItem,
    MDBContainer,
    MDBBtn,
    MDBIcon,
    MDBBadge,
    MDBInput, MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter,
    MDBTooltip,
    MDBScrollbar,
} from "mdbreact";
import axios from "axios";

class GroupsPage extends Component{
    state = {
        modal14: false,
        group: null,
        items: [
            {
                name: "milk",
                purchased: true,
            }
        ],
        itemName: "",
        itemPrice: 0.00,
        itemQuantity: 1,
        itemMeasure: "",
        itemPurchased: false,
        total: 0.00,
        listToggle: true,
        histToggle: false,
        groupHistory: null,
    }

//     async componentWillMount(){ // this version of CWM queries the single group, rather than collecting all groups.
//         // see if the desired group is in state
//         if(!this.props.currentGroup || this.props.currentGroup === null || this.props.currentGroup.id !== this.props.match.params.id){
//             console.log('NO GROUP IN STATE');
//             // if not, fetch it from the database
//             // this function is necessary to prevent the app crashing on refresh or if a user visits it from a direct link, e.g. a bookmark
//             await this.props.getSingleGroup(this.props.match.params.id); // fetches group info from server and adds it to state

    /*
     * Triggers before the component mounts.
     * Retrieve a list of items from state
    */
    componentWillMount() {
        this.props.gettingGroups();
        this.props.getItems(Number(this.props.match.params.id));
        this.getGroupHistory();

        if (this.props.groups !== null) {
            const group = this.props.groups.filter(grp => grp.id === Number(this.props.match.params.id));
            this.setState({ group: group[0]})
        }
    }

    /*
     * Retrieve the group history and save to component state
    */
    getGroupHistory = () => {
        let backendURL;
        if(process.env.NODE_ENV === 'development'){
            backendURL = `http://localhost:9000`
        } else {
            backendURL = `https://shoptrak-backend.herokuapp.com`
        }

        const token = localStorage.getItem('jwt');
        const endpoint = `${backendURL}/api/grouphistory/group/${this.props.match.params.id}`;

        const options = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        axios.get(endpoint, options).then(res => {
            this.setState({ groupHistory: res.data.data})
        }).catch(err => console.log(err));
    }

    // Toggles the modals
    toggle = nr => () => {
        let modalNumber = 'modal' + nr
        this.setState({
            [modalNumber]: !this.state[modalNumber]
        });
    }

    /*
     * Handles all text/number inputs
     * @param e - Event
     */
    handleInput = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    /*
     * Ticks the item checkbox in adding an item
     */
    itmPurchased = () => {
        this.setState({itemPurchased: true})
    }

    /*
     * Checks the item checkbox on the list
     * @param e - Event
     */
    check = e => {
        // Filter the item so we can check if the item has already been purchased.
        const item = this.props.items.filter(itm => itm.id === e);

        // Only check to box if the item hasn't been purchased
        if (item[0].purchasedBy === null) {
            this.props.updateItemPurchesd(e);
        }
    }

    // Submits a one or more items to be purchased
    handleSubmitItems = e => {
        e.preventDefault();
        // Filter to make sure we are not sending in previous bought items
        const purchased = this.props.items.filter(itm => itm.purchased === true && itm.purchasedBy === null);
        this.props.submitPaidItems(purchased, Number(localStorage.getItem("userId")), Number(this.state.total));
        this.props.getItems(Number(this.props.match.params.id));
    }

    // Change between List and History views
    toggleListClass = () => {

        this.setState({ histToggle: false, listToggle: true})
    }

    toggleHistClass = () => {
        this.setState({ histToggle: true, listToggle: false})
    }

    /*
     * Creates an item object and send it to the action to add to the database
    */
    handleAddItem = (e) => {
        e.preventDefault();

        let item = null;

        // Check if purchased checkbox was ticked
        if (this.state.itemPurchased) {
            item = {
                name: this.state.itemName,
                groupID: Number(this.props.match.params.id),
                price: Number(this.state.itemPrice),
                quantity: Number(this.state.itemQuantity),
                measurement: this.state.itemMeasure,
                purchased: this.state.itemPurchased
            };

            this.props.addItem(item);
            this.setState({modal14: false});
        } else {
            item = {
                name: this.state.itemName,
                groupID: Number(this.props.match.params.id),
                price: Number(this.state.itemPrice),
                quantity: Number(this.state.itemQuantity),
                measurement: this.state.itemMeasure
            };
            this.props.addItem(item);
            this.setState({modal14: false});
        }

    }

    /*
     * Calculate the total amount the member has spent
     * @params items - Array of items to tally
     */
    totalItems = (items) => {
        const total = items.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.total;
        }, 0);

        return total;
    }


    render(){
//         console.log('current group', this.props.currentGroup);
//         const purchased = this.props.items.filter(itm => itm.purchased === true);

        // if(!this.props.currentGroup){ // tell user info is loading...
        //     /**
        //      * @TODO Create a loading component that can render during data queries
        //      */
        //     return (
        //         <div>Fetching group information...</div>
        //     )
        // } else {

        // Filter items by which has been purchased - used for the `I Bought` form
        let purchased = [];
        this.props.items !== null ? purchased = this.props.items.filter(itm => itm.purchased === true && itm.purchasedBy === null) : purchased = [];
        // Gather histories
        const histories = this.state.groupHistory;
        if (histories !== null) {
            console.log("NOT NULL => ", histories)
        }
        return (
            <div>
                <div className={"group-profile-container"}>
                    <div className={"group-profile-header"}>
                        <MDBBtn color="primary" onClick={() => {this.toggleListClass()}}>List</MDBBtn>
                        <MDBBtn color="primary" onClick={() => {this.toggleHistClass()}} >History</MDBBtn>
                        <MDBBtn color="primary" >Invite</MDBBtn>
                        <MDBBtn color="primary" >Total</MDBBtn>
                    </div>
                    <div className={"group-profile-header-title"}><h3></h3></div>
                    <div className={"group-profile-columns"}>
                        <div className={"group-profile-list"}>
                            <div className={"group-profile-list-container scrollbar"}>
                                <MDBContainer>
                                    <MDBContainer >
                                        {
                                            this.state.listToggle === true ? <MDBListGroup>
                                                {
                                                    this.props.items !== null ? this.props.items.map((item, i) => (
                                                        <MDBListGroupItem key={i} className="d-flex justify-content-evenly align-items-center">
                                                            <button type="button" onClick={() => this.check(item.id)} className={item.purchased ? "close1 item-purchased close" : "close close1"} aria-label="Close">
                                                                <MDBBadge color="primary"><MDBIcon icon="check" /> </MDBBadge>
                                                            </button>
                                                            <p className={"item-name"}>{item.name}</p>
                                                            {/*<button type="button" className="close" aria-label="Close">*/}
                                                                {/*<span aria-hidden="true">×</span>*/}
                                                            {/*</button>*/}
                                                        </MDBListGroupItem>
                                                    )) : null
                                                }
                                            </MDBListGroup> : <div className={"history-list"}>
                                                {
                                                    histories !== null ? histories.map((itm,i) => (
                                                        <div>
                                                            <MDBListGroup>
                                                                <MDBListGroupItem>
                                                                <h3>{histories[i][0].user}</h3>
                                                                {
                                                                    histories[i].map((it, ii) => (
                                                                        <p className={"history-items"}>{it.name}</p>
                                                                    ))
                                                                }
                                                                <h4>{histories[i][0].date} | Total: $ {histories[i][histories[i].length - 1].grandTotal}</h4>
                                                                </MDBListGroupItem>
                                                                <br></br>
                                                            </MDBListGroup>
                                                        </div>



                                                    )) : <p>NULL</p>
                                                }
                                            </div>
                                        }


                                    </MDBContainer>
                                </MDBContainer>
                            </div>
                            {
                                this.state.listToggle === true ? <div className={"group-profile-list-button"}>
                                    <MDBBtn color="primary" onClick={this.toggle(14)} >ADD</MDBBtn>
                                </div> : null
                            }

                        </div>

                        <div className={"group-profile-right-col"}>
                            <div className={"group-profile-gross"}>
                                <p>MEM 1</p>
                                <p>MEM 2</p>
                            </div>
                            {this.state.listToggle === true ? <div className={"group-profile-bought"}>
                                <h1>I BOUGHT</h1>
                                <div className={"group-profile-bought-list"}>
                                    {
                                        purchased !== null ?
                                            purchased.map(itm => (
                                                <p>{itm.name}, </p>
                                            )) : null
                                    }
                                </div>
                                <div className={"group-profile-bought-input"}>
                                    <h1>$</h1><MDBInput label="I Paid" type={"number"} step={0.01} name={"total"}
                                                        onChange={this.handleInput} defaultValue={this.state.total}/>
                                </div>
                                <div className={"group-profile-bought-button"}>
                                    <MDBBtn color="primary" onClick={e => this.handleSubmitItems(e)}>Submit</MDBBtn>
                                </div>
                            </div> : null
                            }
                        </div>
                    </div>

                </div>
                <MDBContainer>
                    <MDBModal isOpen={this.state.modal14} toggle={this.toggle(14)} centered>
                        <MDBModalHeader toggle={this.toggle(14)}>Add New Item</MDBModalHeader>
                        <MDBModalBody>
                            <form className="needs-validation" onSubmit={this.handleAddItem}>
                                <MDBInput className={"form-control"} required label="Item Name *" type={"text"} name={"itemName"} onChange={this.handleInput} defaultValue={this.state.groupName}/>
                                <MDBInput required label="Item Price *" type={"number"} step={0.01} name={"itemPrice"} onChange={this.handleInput} defaultValue={this.state.itemPrice}/>
                                <MDBInput required label="Item Quantity *" type={"number"} name={"itemQuantity"} onChange={this.handleInput} defaultValue={this.state.itemQuantity}/>
                                <MDBInput label="Item Measurement" type={"text"} name={"itemMeasure"} onChange={this.handleInput} defaultValue={this.state.itemMeasure}/>
                                <MDBTooltip
                                    placement="top"
                                    tag="div"
                                    tooltipContent="Item will be added to bought list. Does not save until you submit all purchased items.">
                                    <div style={{ textAlign: "center" }}>
                                        <div className="md-checkbox md-checkbox-inline">
                                            <input id="i2" type="checkbox" defaultChecked={this.state.itemPurchased} onClick={this.itmPurchased} />
                                            <label htmlFor="i2">Purchased</label>
                                        </div>
                                    </div>
                                </MDBTooltip>
                            </form>
                        </MDBModalBody>
                        <MDBModalFooter>
                            <MDBBtn color="secondary" onClick={this.toggle(14)}>Close</MDBBtn>
                            <MDBBtn color="primary" onClick={e => this.handleAddItem(e)}>Create</MDBBtn>
                        </MDBModalFooter>
                    </MDBModal>
                </MDBContainer>
            </div>
        )
    }
}

const mapStateToProps = state => {
    state = state.rootReducer; // pull values from state root reducer
    return {
        //state items
        groups: state.groups,
        items: state.items,
        currentGroup: state.currentGroup,
    }
}

export default connect(mapStateToProps, {
//     checkEmail, gettingGroups, addGroup, getItems, getSingleGroup
    gettingGroups, addItem, getItems, updateItemPurchesd, submitPaidItems
})(GroupsPage);