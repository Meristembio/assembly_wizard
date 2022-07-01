import React from 'react';
import './assembly_wizard.css';
import AssemblyStandards from './components/AssemblyStandards';
import * as ReactDOMServer from 'react-dom/server';
import $ from 'jquery';

const defaultState = {
        enzyme: null,
        receiver: null,
        inserts: [],
        complete: false,
        name: '',
        loading: false,
        parts: null,
        assembly_standard: 'loop',
        apiError: ''
    }

function OHRender(ohSeq, assembly_standard) {
    let result = "Custom: " + ohSeq
    const standardOHS = AssemblyStandards[assembly_standard].ohs
    for(var key in standardOHS) {
        if(standardOHS[key].oh === ohSeq){
            result = standardOHS[key].name + ": " + ohSeq
        }
    }
    return result
}

class PartRenderAssembly extends React.Component {
    render() {
        const part = this.props.part

        return <div className="alert border border-secondary">
            <p className="mb-0"><strong>{part.n}</strong> <a href={"/inventory/plasmid/" + part.i} target="_blank" rel="noreferrer"><i
            className="bi bi-box-arrow-up-right"></i></a></p>
            <p className="mb-0"><span className="text-muted">{OHRender(part.o5, this.props.assembly_standard)} / {OHRender(part.o3, this.props.assembly_standard)}</span></p>
        </div>
    }
}

class InsertRender extends React.Component {
    render() {
        const part = this.props.part

        let className = ""
        if(this.props.active){
            className = "table-primary"
        }

        return <tr className={className}>
            <td>{part.n} <a href={"/inventory/plasmid/" + part.i} target="_blank" rel="noreferrer"><i
                className="bi bi-box-arrow-up-right"></i></a></td>
            <td>{OHRender(part.o5, this.props.assembly_standard)}</td>
            <td>{OHRender(part.o3, this.props.assembly_standard)}</td>
            <td>
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    value={part.i}
                    onClick={this.props.addPartHandler}>
                    Add
                </button>
            </td>
        </tr>
    }
}


class ReceiverRender extends React.Component {
    render() {
        const part = this.props.part

        let className = ""
        if(this.props.active){
            className = "table-primary"
        }

        return <tr className={className}>
            <td>{part.n} <a href={"/inventory/plasmid/" + part.i} target="_blank" rel="noreferrer"><i class="bi bi-box-arrow-up-right"></i></a></td>
            <td>{OHRender(part.o3, this.props.assembly_standard)}</td>
            <td>{OHRender(part.o5, this.props.assembly_standard)}</td>
            <td>
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    value={part.i}
                    onClick={this.props.setReceiverHandler}>
                    Set
                </button>
            </td>
        </tr>
    }
}

class EnzymeRender extends React.Component {
    render() {
        let button_class = "btn btn-secondary"
        if(this.props.active) button_class = "btn btn-primary"

        return <button type="button" className={button_class + " me-2 mb-2"} name={"enzyme-" + this.props.value} value={this.props.value} onClick={this.props.setEnzymeHandler}>{this.props.name}</button>
    }
}

class TableFilter extends React.Component {
    render() {
        return <div className="col-md-4">
            <div className="input-group">
                <input value={this.props.text} className="form-control" placeholder="Filter ..." onChange={this.props.filterHandler} />
                <button onClick={this.props.filterClearHandler} type="button" className="btn bg-transparent">
                    <i className="bi bi-x-circle"></i>
                </button>
            </div>
            <p></p>
        </div>
    }
}

class PartSelector extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            receiverFilter: '',
            insertFilter: ''
        }
    }
    addInsertHandler = (event) => {
        this.setState({
            insertFilter: "",
        })
        this.props.addPartHandler(event)
    }
    filterReceiverHandler = (event) => {
        this.setState({
            receiverFilter: event.target.value,
        })
    }
    filteriInsertHandler = (event) => {
        this.setState({
            insertFilter: event.target.value,
        })
    }
    filterReceiverClearHandler = (event) => {
        this.setState({
            receiverFilter: "",
        })
    }
    filteriInsertClearHandler = (event) => {
        this.setState({
            insertFilter: "",
        })
    }
    render() {
        const config = this.props.config
        let receiver_output = <div>
            <h3>Receiver</h3>
            <p className="alert alert-info">Set name and select an enzyme to show options</p>
        </div>
        let inserts_output = <div>
            <h3>Inserts</h3>
            <p className="alert alert-info">Set a receiver to show options</p>
        </div>
        if(config.enzyme && config.name && config.parts && !config.loading){
            receiver_output = []
            let receivers = []
            receiver_output.push(<h3>Receiver</h3>)
            receiver_output.push(<TableFilter text={this.state.receiverFilter} filterClearHandler={this.filterReceiverClearHandler} filterHandler={this.filterReceiverHandler} />)
            config.parts.forEach((part) => {
                if(part.t === 1 && part.n.toLowerCase().includes(this.state.receiverFilter.toLowerCase())){
                    let active = false
                    if(part === config.receiver) active = true
                        receivers.push(<ReceiverRender assembly_standard={config.assembly_standard} part={part} active={active} config={config} setReceiverHandler={this.props.setReceiverHandler} />)
                }
            })
            if(receivers.length)
                receiver_output.push(<div className="aw_part_table mb-4">
                    <div className="alert alert-light">
                        <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">OH 5</th>
                                <th scope="col">OH 3</th>
                                <th scope="col">Set</th>
                            </tr>
                        </thead>
                        <tbody>{receivers}</tbody>
                    </table>
                    </div>
                </div>)
            else
                receiver_output.push(<div className="alert alert-danger">No receivers found</div>)

            inserts_output = []
            let inserts = []
            inserts_output.push(<h3>Inserts</h3>)

            if(config.receiver && !config.complete){
                inserts_output.push(<TableFilter text={this.state.insertFilter} filterClearHandler={this.filteriInsertClearHandler} filterHandler={this.filteriInsertHandler} />)
                let last_part_added = config.receiver
                if(config.inserts.length){
                    last_part_added = config.inserts[config.inserts.length - 1]
                }
                config.parts.forEach((part) => {
                    if(part.t === 0 && last_part_added.o3 === part.o5 && part.n.toLowerCase().includes(this.state.insertFilter.toLowerCase())){
                        inserts.push(<InsertRender assembly_standard={config.assembly_standard} part={part} addPartHandler={this.addInsertHandler} />)
                    }
                })
                if(inserts.length) {
                    inserts_output.push(<div className="aw_part_table mb-4">
                        <div className="alert alert-light">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">OH 5</th>
                                    <th scope="col">OH 3</th>
                                    <th scope="col">Addt</th>
                                </tr>
                                </thead>
                                <tbody>{inserts}</tbody>
                            </table>
                            <p className="alert alert-info fs-6">Only compatible inserts are listed</p>
                        </div>
                    </div>)
                }
                else
                    inserts_output.push(<div className="alert alert-danger">No inserts found</div>)

            } else {
                if(config.complete){
                    inserts_output.push(<div className="alert alert-success">Assembly complete</div>)
                } else {
                    inserts_output.push(<div className="alert alert-info">Set a receiver to continue</div>)
                }
            }
        }

        let receiver_insert_output = []
        receiver_insert_output.push(<div className="row collapse">
            {receiver_output}
            <Pagination step={2} stepHandler={this.props.stepHandler}></Pagination>
        </div>)
        receiver_insert_output.push(<div className="row collapse">
            {inserts_output}
            <Pagination step={3} stepHandler={this.props.stepHandler}></Pagination>
        </div>)

        return receiver_insert_output
    }
}

class AssemblyResult extends React.Component {
    render() {
        const config = this.props.config
        const receiver = config.receiver

        let receiver_output = <div className="alert alert-info">Set a receiver to show the assembly</div>
        let complete_assembly = <div className="alert alert-info">Add parts to complete the assembly</div>
        let inserts_output = <div className="alert alert-info">No inserts selected</div>

        if(receiver) {
            receiver_output = []
            receiver_output.push(<p className="alert alert-primary">Backbone</p>)
            receiver_output.push(<PartRenderAssembly assembly_standard={config.assembly_standard} part={receiver} />)
            if(config.inserts.length){
                if(config.complete){
                    complete_assembly = <div className="alert alert-success">Assembly complete</div>
                }
                inserts_output = []
                inserts_output.push(<div className="alert alert-primary">Inserts</div>)
                config.inserts.forEach((insert) => {
                    inserts_output.push(<PartRenderAssembly assembly_standard={config.assembly_standard} part={insert} />)
                })
                inserts_output.push(<p><button type="button" className="btn btn-outline-danger" onClick={this.props.removeLastPartHandler}>Remove last insert</button></p>)
            }
        } else {
            complete_assembly = ""
            inserts_output = ""
        }

        return <div>
            <div>
                {complete_assembly}
            </div>
            <div>
                {receiver_output}
            </div>
            <div>
                {inserts_output}
            </div>
        </div>
    }
}

class PlasmidMap extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            canvas_size: 800
        }
        this.theIframe = React.createRef()
    }

    componentDidMount () {
        this.setState({
            canvas_size: this.theIframe.current.offsetWidth
        })
    }

    render() {
        const config = this.props.config

        if(config.receiver){
            let length = config.receiver.len
            let insert_trackmarkers = []

            const colors = [
                'rgba(170,0,85,0.9)',
                'rgba(85,0,170,0.9)',
                'rgba(0,85,170,0.9)',
                'rgba(85,170,0,0.9)',
                'rgba(170,85,0,0.9)',
                'rgba(128,64,64,0.8)',
            ]

            let colori = 0

            if(config.inserts.length){
                let currPos = 0
                config.inserts.forEach((insert) => {
                    length += insert.len
                    insert_trackmarkers.push(
                        <trackmarker start={currPos} end={currPos+insert.len} markerstyle={"fill:"+colors[colori]}>
                            <markerlabel vadjust="50" type="path" labelstyle={"font-size:12px;font-weight:400;fill:"+colors[colori]} text={insert.n}></markerlabel>
                        </trackmarker>
                    )
                    colori += 1
                    if(colori >= colors.length) colori = 0
                    currPos += insert.len
                })
            }

            let plasmid_name = this.props.name
            if(!plasmid_name) plasmid_name = "Set plasmid name"

            let canvas_size = this.state.canvas_size
            if(canvas_size > 600) canvas_size = 600

            let html = ReactDOMServer.renderToString(
                <html>
                <head>
                    <title>Plasmid Map</title>
                    <script src='/static/js/angularplasmid.complete.min.js'></script>
                </head>
                <body style={{'width':'100%', 'overflow': 'hidden', 'textAlign': 'center'}}>
                <plasmid id='p1' sequencelength={length} plasmidwidth={canvas_size + 50}  plasmidheight={canvas_size + 100}>
                    <plasmidtrack width="5" trackstyle='fill:#ccc;' radius={canvas_size/2 - 40}></plasmidtrack>
                    <plasmidtrack trackstyle='fill:rgba(225,225,225,0.5);' radius={canvas_size/2 - 50}>
                        <tracklabel labelstyle="font-size:20px;font-weight:600;fill:#666;" text={plasmid_name}></tracklabel>
                        <tracklabel labelstyle="font-size:12px;font-weight:200;fill:#999;" text={length + " bp"} vadjust="18"></tracklabel>
                        <trackscale className='smajor' style={{'strokeWidth': 1, stroke:"#888"}} ticksize='4' interval={200} labelstyle="font-size:9px;fill:#666" labelvadjust="15" showlabels='1' labelclass='sml'></trackscale>
                        <trackmarker start={length-config.receiver.len} end={length} markerstyle="fill:transparent">
                            <markerlabel vadjust="50" type="path" labelstyle="font-size:12px;fill:#888;font-weight:400" text={"Backbone: " + config.receiver.name}></markerlabel>
                        </trackmarker>
                        {insert_trackmarkers}
                    </plasmidtrack>
                </plasmid>
                </body>
                </html>
            )
            const iframe = ReactDOMServer.renderToString(
                <iframe title="Plasmid Map" width="100%" height={canvas_size + 100} srcDoc={html}></iframe>
            )
            return <div ref={this.theIframe} dangerouslySetInnerHTML={{__html: iframe}}></div>
        }

        return <div ref={this.theIframe} className="alert alert-info">Set a backbone to generate the plasmid map</div>
    }
}

class Pagination extends React.Component {
    render(){
        let next_button = ""
        if(this.props.step < 3)
            next_button = <button className="btn btn-success float-end" onClick={() => {this.props.stepHandler(this.props.step + 1)}}>Next</button>
        let prev_button = ""
        if(this.props.step > 1)
            prev_button = <button className="btn btn-secondary float-end me-2" onClick={() => {this.props.stepHandler(this.props.step - 1)}}>Prev</button>
        return <div className="row">
            <div className="col-9">
            </div>
            <div className="col-3">
                {next_button}
                {prev_button}
            </div>
        </div>
    }
}

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = defaultState
    }
    setStandardHandler = (event) => {
        this.setState({
            receiver: null,
            inserts: [],
            parts: [],
            complete: false,
            apiError: '',
            assembly_standard: event.target.value,
            enzyme: ''
        })
    }
    setName = (event) => {
        this.setState({
            name: event.target.value
        })
    }
    removeLastPartHandler = (event) => {
        let inserts = this.state.inserts
        inserts.pop()

        this.setState({
            inserts: inserts,
            complete: false
        })
    }
    addPartHandler = (event) => {
        let inserts = this.state.inserts
        let newPart = null
        this.state.parts.forEach((part) => {
            if(part.i === event.target.value){
                newPart = part
            }
        })

        let complete = false
        if(newPart){
            inserts.push(newPart)
            if(this.state.receiver.o5 === newPart.o3)
                complete = true
        }

        this.setState({
            inserts: inserts,
            complete: complete
        })
    }
    setReceiverHandler = (event) => {
        let receiver = null
        this.state.parts.forEach((part) => {
            if(part.i === event.target.value){
                receiver = part
            }
        })
        let inserts = this.state.inserts
        if(this.state.receiver)
            if(receiver.oh5 !== this.state.receiver.oh5
                || receiver.oh3 !== this.state.receiver.oh3){
                inserts = []
            }
        this.setState({
            receiver: receiver,
            inserts: inserts
        })
    }
    setEnzymeHandler = (event) => {
        if(event.target.value !== this.state.enzyme){
            this.setState({
                receiver: null,
                inserts: [],
                parts: [],
                complete: false,
                loading: true,
                apiError: '',
                enzyme: event.target.value
            },() => {
                this.apiCall()
            })
        }
    }

    apiCall(){
        const axios = require('axios');
        const url = 'http://192.168.1.64:8000/inventory/api/parts/' + this.state.enzyme + '/' + this.state.assembly_standard + '/'
        // const url = '/inventory/api/parts/' + this.state.enzyme + '/' + this.state.assembly_standard + '/'
        axios.get(url)
            .then((response) => {
                this.setState({
                    apiError: response.data.error,
                    parts: response.data.parts,
                    loading: false
                })
            })
    }

    stepHandler(step){
        $('#steps').children().removeClass('show')
        $('#steps > *:nth-child(' + (step) + ')').addClass('show')
        $('#pagination').children().removeClass('active')
        $('#pagination > *:nth-child(' + (step) + ')').addClass('active')
        $('#pagination a span:first-child').removeClass('bg-light').removeClass('text-primary').addClass('bg-primary')
        $('#pagination > *:nth-child(' + (step) + ') a span:first-child').addClass('bg-light').addClass('text-primary')
    }

    render () {
        let loading_output = ""
        if(this.state.loading)
            loading_output = <div className="alert alert-success">
                <div className="spinner-grow spinner-grow-sm" role="status">
                    <span className="visually-hidden">...</span>
                </div> Loading parts
            </div>
        let output = []
        let disabled = 'disabled'
        let next_step_text = "End assembly to continue"
        if(this.state.complete) {
            disabled = ''
            next_step_text = "Next step"
        }

        let get_params = "n=" + this.state.name
        if(this.state.receiver)
            get_params += "&b=" + this.state.receiver.i
        if(this.state.inserts.length) {
            let insert_names = []
            this.state.inserts.forEach((insert) => {
                insert_names.push(insert.i)
            })
            get_params += "&i=" + insert_names.join("+")
        }
        const enzymes_output = []
        AssemblyStandards[this.state.assembly_standard].enzymes.forEach((enzyme_data) => {
            let active = false
            if(enzyme_data.value === this.state.enzyme) active = true
            enzymes_output.push(<EnzymeRender name={enzyme_data.name} value={enzyme_data.value} active={active} setEnzymeHandler = {this.setEnzymeHandler} />)
        })
        const assembly_standards_options = []
        for(const [key, value] of Object.entries(AssemblyStandards)){
            let selected = false
            if(this.state.assembly_standard === key) selected = true
            assembly_standards_options.push(<option selected={selected} value={key}>{value.name}</option>)
        }
        let api_error_output = ""
        if(this.state.apiError)
            api_error_output = <div className="alert alert-danger">{this.state.apiError}</div>
        output = <div id="assembly_wizard-main">
                {api_error_output}
            {this.state.apiError}
                <div className="row">
                    <div className="col-8">
                        <h2>Setup</h2>
                        <nav aria-label="Page navigation">
                            <ul id="pagination" className="pagination">
                                <li className="page-item active" onClick={() => {this.stepHandler(1)}}><a className="page-link" href="#"><span
                                    className="badge bg-light text-primary">Step 1</span><span className="ms-1">Name & enzyme</span></a></li>
                                <li className="page-item" onClick={() => {this.stepHandler(2)}}><a className="page-link" href="#"><span
                                    className="badge bg-primary">Step 2</span><span className="ms-1">Receiver</span></a></li>
                                <li className="page-item" onClick={() => {this.stepHandler(3)}}><a className="page-link" href="#"><span
                                    className="badge bg-primary">Step 3</span><span className="ms-1">Inserts</span></a></li>
                            </ul>
                        </nav>
                        <div id="steps" className="border alert alert-secondary mb-4">
                            <div className="collapse show">
                                <div className="row">
                                    <div className="col-4">
                                        <h3>Name</h3>
                                        <p><input className="form-control" type="text" placeholder="Plasmid name" onChange={this.setName} /></p>
                                    </div>
                                    <div className="col-4">
                                        <h3>Assembly Standard</h3>
                                        <div>
                                            <select onChange={this.setStandardHandler} className="form-select">
                                                {assembly_standards_options}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <h3>Level / Enzyme</h3>
                                        <div>
                                            <p>{enzymes_output}</p>
                                        </div>
                                    </div>
                                    <Pagination step={1} stepHandler={this.stepHandler}></Pagination>
                                </div>
                            </div>
                            <PartSelector stepHandler={this.stepHandler} config={this.state} setReceiverHandler={this.setReceiverHandler} addPartHandler={this.addPartHandler} />
                        </div>
                        {loading_output}
                        <h2>Map</h2>
                        <PlasmidMap config={this.state} name={this.state.name} />
                    </div>
                    <div className="col-4">
                        <h2>Next</h2>
                        <p>
                            <a href={window.next_url + "?" + get_params} className={"me-2 btn btn-outline-primary " + disabled}>{next_step_text}</a>
                            <a href={window.next_url} className="btn btn-outline-secondary">Skip wizard</a>
                        </p>
                        <h2>Assembly</h2>
                        <AssemblyResult config={this.state} removeLastPartHandler={this.removeLastPartHandler} />
                    </div>
                </div>
            </div>

        return <div id="assembly_wizard">
            <div className="container">
                <div className="row">
                    {output}
                </div>
            </div>
        </div>
    }
}

export default App;
