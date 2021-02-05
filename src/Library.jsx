import React, { Component } from "react";
// import cloneDeep from 'lodash/cloneDeep';

export function getValueFromLink( tree, link ) {
    let miner = tree;
    for ( const branchToSlope of link ) {
        miner = miner[ branchToSlope ];
    }
    return miner;
}

export const isValuesOnLinksEqual = links => ( prevAppStateContainer, nextAppStateContainer ) => {
    for ( const link of links ) {
        if (
            getValueFromLink( prevAppStateContainer.appState, link ) !==
            getValueFromLink( nextAppStateContainer.appState, link )
        ) return false;
    }
    return true;
};

function update( what ) {
    return Object.prototype.toString.call( what ) === '[object Array]' ? [ ...what ] : { ...what };
}

export function setValueOnLink( treein, link, value ) {
    let growingLink = [];
    const tree = update( treein );
    for ( const currentNodeName of link.slice( 0, -1 ) ) {
        let parentNode = tree;
        for ( const nodeName of growingLink ) {
            parentNode = parentNode[ nodeName ];
        }
        parentNode[ currentNodeName ] = update( parentNode[ currentNodeName ] );
        growingLink.push( currentNodeName );
    }
    let parentNode = tree;
    for ( const nodeName of growingLink ) {
        parentNode = parentNode[ nodeName ];
    }
    parentNode[ link[ link.length - 1 ] ] = value;
    return tree;
}

export const getAppStateAndActionsConsumer = Context =>
( { children } ) => (
    <Context.Consumer>
        { ( { appState, stateDependentActions } ) => (
            children( appState, stateDependentActions )
        ) }
    </Context.Consumer>
);

export const getGeneratorOfAppStateAndActionsConsumersThatRerendersOnlyWhenValuesOnLinksChanged = Context => links => {
    const Wrapper = React.memo(
        // @ts-ignore
        ( { children, appState, stateDependentActions } ) => children( appState, stateDependentActions ),
        isValuesOnLinksEqual( links )
    )
    return ( { children } ) => (
        <Context.Consumer>
            { ( { appState, stateDependentActions } ) => (
                React.createElement(
                    Wrapper,
                    { appState, stateDependentActions, children }
                )
            ) }
        </Context.Consumer>
    )
};

export const getGeneratorOfComponentsSubscribedForLinks = Context => ( Component, links ) => {
    const SomeShit = getGeneratorOfAppStateAndActionsConsumersThatRerendersOnlyWhenValuesOnLinksChanged( Context )( links );
    return props => (
        <SomeShit
            children={
                ( appState, stateDependentActions ) => React.createElement( Component, {...props, appState, stateDependentActions } )
            }
        />
    )
};

export const getAppStateAndActionsProvider = Context => (
class extends Component {
    setStateNode = ( link, value ) => this.setState( prevState => setValueOnLink( prevState, link, value ) );
    getStateNode = link => getValueFromLink( this.state, link );
    actions = {};
    state = {};
    render() {
        return React.createElement(
            Context.Provider,
            {
                value: {
                    appState: { ...this.state },
                    stateDependentActions: this.actions,
                }
            },
            this.props.children
        );
    }
}
);

export default function createNewKit() {
    const AppContext = React.createContext( {
        appState: {},
        stateDependentActions: {}
    } );
    return {
        AppStateAndActionsProvider: getAppStateAndActionsProvider( AppContext ),
        AppStateAndActionsConsumer: getAppStateAndActionsConsumer( AppContext ),
        getComponentSubscribedForLinks: getGeneratorOfComponentsSubscribedForLinks( AppContext ),
        getAppStateAndActionsConsumerThatRerendersOnlyWhenValuesOnLinksChanged: getGeneratorOfAppStateAndActionsConsumersThatRerendersOnlyWhenValuesOnLinksChanged( AppContext )
    };
}
