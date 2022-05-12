import React from 'react';
import './assembly_wizzard.css';

const defaultState = {
        level: 'odd',
        receiver: null,
        inserts: []
    }

const parts = [
    {
        id: '1',
        name: 'pCAodd-1',
        oh3: 'GGAG',
        oh5: 'CGCT',
        level: 1,
        type: 'r'
    },
    {
        id: '2',
        name: 'pCAodd-2',
        oh3: 'GGAG',
        oh5: 'CGCT',
        level: 1,
        type: 'r'
    },
    {
        id: '10',
        name: 'AC-J23101',
        oh5: 'GGAG',
        oh3: 'AATG',
        level: 0,
        type: 'i'
    },
    {
        id: '11',
        name: 'AC-J23118',
        oh5: 'GGAG',
        oh3: 'AATG',
        level: 0,
        type: 'i'
    },
    {
        id: '12',
        name: 'CE-GFP',
        oh5: 'AATG',
        oh3: 'GCTT',
        level: 0,
        type: 'i'
    },
    {
        id: '13',
        name: 'EF-B0015',
        oh5: 'GCTT',
        oh3: 'CGCT',
        level: 0,
        type: 'i'
    }
]

class InsertRenderAssembly extends React.Component {
    render() {
        const part = this.props.part

        return <p>
        {part.oh5} / {part.name} / {part.oh3}
        </p>
    }
}

class ReceiverRenderAssembly extends React.Component {
    render() {
        const part = this.props.part

        return <p>
        {part.oh5} / {part.name} / {part.oh3}
        </p>
    }
}

class InsertRender extends React.Component {
    render() {
        const part = this.props.part

        return <button
        type="button"
        className="btn btn-outline-secondary"
        name={"receiver-set-" + part.id}
        value={part.id}
        onClick={this.props.addPartHandler}>
        {part.oh5} / {part.name} / {part.oh3}
        </button>
    }
}


class ReceiverRender extends React.Component {
    render() {
        const part = this.props.part

        let button_class = "btn btn-outline-secondary"
        if(this.props.active) button_class = "btn btn-secondary"

        return <button
        type="button"
        className={button_class}
        name={"receiver-set-" + part.id}
        value={part.id}
        onClick={this.props.setReceiverHandler}>
        {part.oh5} / {part.name} / {part.oh3}
        </button>
    }
}

class LevelRender extends React.Component {
    render() {
        let button_class = "btn btn-outline-secondary"
        if(this.props.active) button_class = "btn btn-secondary"

        return <button type="button" className={button_class} name={"level-" + this.props.value} value={this.props.value} onClick={this.props.setLevelHandler}>{this.props.name}</button>
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
            receiver_output.push(<h3>Receiver</h3>)
            parts.forEach((part) => {
                if(
                (('odd' === config.level && part.level%2 === 1) || ('even' === config.level && part.level%2 === 0))
                && part.type === 'r'
                ){
                let active = false
                if(part === config.receiver) active = true
                receiver_output.push(<ReceiverRender part={part} active={active} config={config} setReceiverHandler={this.props.setReceiverHandler} />)
                }
            })

            let inserts_output = []
            if(config.receiver){
                inserts_output.push(<h3>Parts</h3>)

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
                    inserts_output.push(<InsertRender part={part} addPartHandler={this.props.addPartHandler} />)
                    }
                })
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
                value: '0'
            },
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
                {levels_output}
            </div>
            {receiver_parts_output}
        </div>
    }
}

class AssemblyResult extends React.Component {
    render() {
        const config = this.props.config
        const receiver = config.receiver

        let receiver_output = "Choose a receiver"
        let complete_assembly = "Add parts to complete the assembly"
        let inserts_output = "No inserts selected"

        if(receiver) {
            receiver_output = <ReceiverRenderAssembly part={receiver} />
            if(config.inserts.length){
                if(config.receiver.oh5 === config.inserts[config.inserts.length -1].oh3){
                    complete_assembly = "Assembly completed"
                }
                inserts_output = []
                config.inserts.forEach((insert) => {
                    inserts_output.push(<InsertRenderAssembly part={insert} />)
                })
            }
        } else {
            complete_assembly = ""
        }

        return <div>
            <h1>Assembly</h1>
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
    render() {
        return <div>plasmidMap</div>
    }
}

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = defaultState
    }
    addPartHandler = (event) => {
        let inserts = this.state.inserts
        parts.forEach((part) => {
            if(part.id === event.target.value){
                inserts.push(part)
            }
        })
        this.setState({
            inserts: inserts
        })
    }
    setReceiverHandler = (event) => {
        let receiver = null
        parts.forEach((part) => {
            if(part.id === event.target.value){
                receiver = part
            }
        })
        this.setState({
            receiver: receiver
        })
    }
    setLevelHandler = (event) => {
        if(event.target.value !== this.state.level){
            this.setState(defaultState)
            this.setState({
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
                        <h2>Choose your parts</h2>
                        <PartSelector config={this.state} setLevelHandler={this.setLevelHandler} setReceiverHandler={this.setReceiverHandler} addPartHandler={this.addPartHandler} />
                    </div>
                    <div className="col-4">
                        <h2>Assembly Result</h2>
                        <AssemblyResult config={this.state} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <h2>Plasmid Map</h2>
                        <PlasmidMap />
                    </div>
                </div>
            </div>
        </div>
    }
}

export default App;
