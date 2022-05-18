import React from 'react';
import './assembly_wizzard.css';
import LoopOHS from './components/LoopOHS';
import * as ReactDOMServer from 'react-dom/server';

const defaultState = {
        level: 'odd',
        receiver: null,
        inserts: [],
        complete: false,
        name: ''
    }

const parts = [
    {
        id: '0',
        name: 'pL0R-mRFP1',
        oh3: 'TCC',
        oh5: 'CGA',
        level: 0,
        type: 'r',
        len: 2021
    },
    {
        id: '1',
        name: 'pCAodd-1',
        oh3: 'GGAG',
        oh5: 'CGCT',
        level: 1,
        type: 'r',
        len: 2021
    },
    {
        id: '2',
        name: 'pCAodd-2',
        oh3: 'GGAG',
        oh5: 'CGCT',
        level: 1,
        type: 'r',
        len: 2021
    },
    {
        id: '10',
        name: 'AC-J23101',
        oh5: 'GGAG',
        oh3: 'AATG',
        level: 0,
        type: 'i',
        len: 35
    },
    {
        id: '11',
        name: 'AC-J23118',
        oh5: 'GGAG',
        oh3: 'AATG',
        level: 0,
        type: 'i',
        len: 36
    },
    {
        id: '12',
        name: 'CE-GFP',
        oh5: 'AATG',
        oh3: 'GCTT',
        level: 0,
        type: 'i',
        len: 714
    },
    {
        id: '13',
        name: 'EF-B0015',
        oh5: 'GCTT',
        oh3: 'CGCT',
        level: 0,
        type: 'i',
        len: 60
    }
]

function OHRender(ohSeq) {
    let result = "Custom: " + ohSeq
    for(var key in LoopOHS) {
        if(LoopOHS[key].oh === ohSeq){
            result = LoopOHS[key].name + ": " + ohSeq
        }
    }
    return result
}

class PartRenderAssembly extends React.Component {
    render() {
        const part = this.props.part

        return <div className="alert border border-secondary">
            <strong>{part.name}</strong>    <span className="text-muted">{part.oh5} / {part.oh3}</span>
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
            <td>{part.name}</td>
            <td>{OHRender(part.oh5)}</td>
            <td>{OHRender(part.oh3)}</td>
            <td>
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    value={part.id}
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
            <td>{part.name}</td>
            <td>{OHRender(part.oh3)}</td>
            <td>{OHRender(part.oh5)}</td>
            <td>
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    value={part.id}
                    onClick={this.props.setReceiverHandler}>
                    Set
                </button>
            </td>
        </tr>
    }
}

class LevelRender extends React.Component {
    render() {
        let button_class = "btn btn-outline-secondary"
        if(this.props.active) button_class = "btn btn-secondary"

        return <button type="button" style={{'margin-right': '.5rem'}} className={button_class} name={"level-" + this.props.value} value={this.props.value} onClick={this.props.setLevelHandler}>{this.props.name}</button>
    }
}

class PartSelector extends React.Component {
    render() {
        const config = this.props.config
        let receiver_parts_output = <div>
            <p>Please selet a level to continue</p>
        </div>
        if(config.level){
            let receiver_output = []
            let receivers = []
            receiver_output.push(<h2>Receiver</h2>)
            parts.forEach((part) => {
                if(
                (('0' === config.level && part.level === 0) || ('odd' === config.level && part.level%2 === 1) || ('even' === config.level && part.level%2 === 0 && part.level !== 0))
                && part.type === 'r'
                ){
                let active = false
                if(part === config.receiver) active = true
                    receivers.push(<ReceiverRender part={part} active={active} config={config} setReceiverHandler={this.props.setReceiverHandler} />)
                }
            })
            receiver_output.push(<table className="table">
                <thead>
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">OH 5</th>
                        <th scope="col">OH 3</th>
                        <th scope="col">Set</th>
                    </tr>
                </thead>
                <tbody>{receivers}</tbody>
            </table>)

            let inserts_output = []
            let inserts = []
            inserts_output.push(<h2>Parts</h2>)
            inserts_output.push(<div>Only compatible parts are listed</div>)

            if(config.receiver && !config.complete){
                let last_part_added = config.receiver
                if(config.inserts.length){
                    last_part_added = config.inserts[config.inserts.length - 1]
                }
                parts.forEach((part) => {
                    if(
                    (('odd' === config.level && part.level%2 === 0) || ('even' === config.level && part.level%2 === 1))
                    && part.type === 'i'
                    && last_part_added.oh3 === part.oh5
                    ){
                        inserts.push(<InsertRender part={part} addPartHandler={this.props.addPartHandler} />)
                    }
                })
                inserts_output.push(<table className="table">
                    <thead>
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">OH 5</th>
                        <th scope="col">OH 3</th>
                        <th scope="col">Set</th>
                    </tr>
                    </thead>
                    <tbody>{inserts}</tbody>
                </table>)
            } else {
                if(config.complete){
                    inserts_output.push(<div className="alert alert-success">Assembly completed</div>)
                } else {
                    inserts_output.push(<div className="alert alert-info">Set a backbone to continue</div>)
                }
            }
            
            receiver_parts_output = <div>
                <div>
                    {receiver_output}
                </div>
                <div>
                    {inserts_output}
                </div>
            </div>
        }
        let levels_data = [
            {
                value: 'odd'
            },
            {
                value: 'even'
            },
        ]
        const levels_output = []
        levels_data.forEach((level_data) => {
            let active = false
            if(level_data.value === config.level) active = true
            levels_output.push(<LevelRender name={"Level " + level_data.value} value={level_data.value} active={active} setLevelHandler = {this.props.setLevelHandler} />)
        })
        return <div>
            <h3>Level</h3>
            <div>
                <p>{levels_output}</p>
            </div>
            {receiver_parts_output}
        </div>
    }
}

class AssemblyResult extends React.Component {
    render() {
        const config = this.props.config
        const receiver = config.receiver

        let receiver_output = <div className="alert alert-info">Choose a receiver</div>
        let complete_assembly = <div className="alert alert-info">Add parts to complete the assembly</div>
        let inserts_output = <div className="alert alert-info">No inserts selected</div>

        if(receiver) {
            receiver_output = []
            receiver_output.push(<p className="alert alert-primary">Backbone</p>)
            receiver_output.push(<PartRenderAssembly part={receiver} />)
            if(config.inserts.length){
                if(config.complete){
                    complete_assembly = <div className="alert alert-success">Assembly completed</div>
                }
                inserts_output = []
                inserts_output.push(<div className="alert alert-primary">Inserts</div>)
                config.inserts.forEach((insert) => {
                    inserts_output.push(<PartRenderAssembly part={insert} />)
                })
                inserts_output.push(<button type="button" className="btn btn-outline-danger" onClick={this.props.removeLastPartHandler}>Remove last insert</button>)
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
                            <markerlabel vadjust="50" type="path" labelstyle={"font-size:12px;font-weight:400;fill:"+colors[colori]} text={insert.name}></markerlabel>
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
                    <script src='./external/angularplasmid.complete.min.js'></script>
                </head>
                <body style={{'width':'100%', 'overflow': 'hidden', 'text-align': 'center'}}>
                <plasmid id='p1' sequencelength={length} plasmidwidth={canvas_size + 50}  plasmidheight={canvas_size + 100}>
                    <plasmidtrack width="5" trackstyle='fill:#ccc;' radius={canvas_size/2 - 40}></plasmidtrack>
                    <plasmidtrack trackstyle='fill:rgba(225,225,225,0.5);' radius={canvas_size/2 - 50}>
                        <tracklabel labelstyle="font-size:20px;font-weight:600;fill:#666;" text={plasmid_name}></tracklabel>
                        <tracklabel labelstyle="font-size:12px;font-weight:200;fill:#999;" text={length + " bp"} vadjust="18"></tracklabel>
                        <trackscale className='smajor' style={{'stroke-width': 1, stroke:"#888"}} ticksize='4' interval={200} labelstyle="font-size:9px;fill:#666" labelvadjust="15" showlabels='1' labelclass='sml'></trackscale>
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

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = defaultState
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
        parts.forEach((part) => {
            if(part.id === event.target.value){
                newPart = part
            }
        })

        inserts.push(newPart)
        let complete = false
        if(this.state.receiver.oh5 === newPart.oh3)
            complete = true

        this.setState({
            inserts: inserts,
            complete: complete
        })
    }
    setReceiverHandler = (event) => {
        let receiver = null
        parts.forEach((part) => {
            if(part.id === event.target.value){
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
    setLevelHandler = (event) => {
        if(event.target.value !== this.state.level){
            this.setState({
                receiver: null,
                inserts: [],
                complete: false,
                level: event.target.value
            })
        }
    }

    render () {
        return <div id="assembly_wizzard">
            <div className="container">
                <h1>Assembly Wizzard</h1>
                <div className="row">
                    <div className="col-8">
                        <h2>Name</h2>
                        <p><input type="text" placeholder="Plasmid name" onChange={this.setName} /></p>
                        <PartSelector config={this.state} setLevelHandler={this.setLevelHandler} setReceiverHandler={this.setReceiverHandler} addPartHandler={this.addPartHandler} />
                    </div>
                    <div className="col-4">
                        <h2>Assembly</h2>
                        <AssemblyResult config={this.state} removeLastPartHandler={this.removeLastPartHandler} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <h2>Map</h2>
                        <PlasmidMap config={this.state} name={this.state.name} />
                    </div>
                </div>
            </div>
        </div>
    }
}

export default App;
