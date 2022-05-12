import React from 'react';
import './assembly_wizzard.css';

const plasmids = [
    {
        id: '2',
        name: 'pCAodd-1',
        oh5: 'GGAG',
        oh3: 'CGCT',
        level: 1,
        type: 'r'
    }
]

class PartSelector extends React.Component {
    render() {
        const config = this.props.config
        if(config.level){
            let backbone_output = null

            if(config.backbone){
                backbone_output = <div>
                    Backbone: {config.backbone.name}
                    <button type="button" class="btn btn-outline-secondary" name="backbone-reset" onClick={this.props.resetBackboneHandler}>Reset Backbone</button>
                    </div>
            } else {
                backbone_output = []
                plasmids.forEach((plasmid) => {
                    if(
                    (('odd' === config.level && plasmid.level%2 === 1) || ('even' === config.level && plasmid.level%2 === 0))
                    && plasmid.type === 'r'
                    )
                    backbone_output.push(<div>
                    {plasmid.name} <button type="button" class="btn btn-outline-secondary" name={"backbone-set-" + plasmid.id} value={plasmid.id} onClick={this.props.setBackboneHandler}>Set Backbone</button>
                    </div>)
                })
            }

            let parts_output = null
            return <div>
                <div>
                    Level {config.level}
                    <button type="button" class="btn btn-outline-secondary" name="level-none" value="" onClick={this.props.setLevelHandler}>Reset Level</button>
                </div>
                <div>
                    {backbone_output}
                </div>
                <div>
                    {parts_output}
                </div>
            </div>
        } else {
            return <div>
                <button type="button" class="btn btn-outline-secondary" name="level-0" value="0" onClick={this.props.setLevelHandler}>L0 Level</button>
                <button type="button" class="btn btn-outline-secondary" name="level-odd" value="odd" onClick={this.props.setLevelHandler}>Odd Level</button>
                <button type="button" class="btn btn-outline-secondary" name="level-even" value="even" onClick={this.props.setLevelHandler}>Even level</button>
            </div>
        }
    }
}

class AssemblyResult extends React.Component {
    render() {
        const config = this.props.config
        let backboneName = "None"
        if(config.backbone) {backboneName = config.backbone.name}
        return <div>
        <p>Level: {config.level}</p>
        <p>Backbone: {backboneName}</p>
        </div>
    }
}

class PlasmidMap extends React.Component {
    render() {
        return <div>plasmidMap</div>
    }
}

const defaultState = {
        level: null,
        backbone: null,
        parts: []
    }
class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = defaultState
    }
    setBackboneHandler = (event) => {
        let backbone = null
        plasmids.forEach((plasmid) => {
            if(plasmid.id === event.target.value){
                backbone = plasmid
            }
        })
        this.setState({
            backbone: backbone
        })
    }
    resetBackboneHandler = (event) => {
        this.setState({
            backbone: null
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
                <div className="row">
                    <div className="col-8">
                        <PartSelector config={this.state} setLevelHandler={this.setLevelHandler} resetBackboneHandler={this.resetBackboneHandler} setBackboneHandler={this.setBackboneHandler} />
                    </div>
                    <div className="col-4">
                        <AssemblyResult config={this.state} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <PlasmidMap />
                    </div>
                </div>
            </div>
        </div>
    }
}

export default App;
