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

export const getAppStateAndActionsConsumer = Context =>
( { children } ) => (
    <Context.Consumer>
        { ( { appState, stateDependentActions } ) => (
            children( appState, stateDependentActions )
        ) }
    </Context.Consumer>
);

export const getGeneratorOfAppStateAndActionsConsumersThatRerendersOnlyWhenValuesOnLinksChanged = Context => links =>
( { children } ) => (
    <Context.Consumer>
        { ( { appState, stateDependentActions } ) => (
            React.createElement(
                React.memo(
                    // @ts-ignore
                    () => children( appState, stateDependentActions ),
                    isValuesOnLinksEqual( links )
                ),
                { appState, stateDependentActions }
            )
        ) }
    </Context.Consumer>
);

export const getGeneratorOfComponentsSubscribedForLinks = Context => ( Component, links ) =>
props => {
    const SomeShit = getGeneratorOfAppStateAndActionsConsumersThatRerendersOnlyWhenValuesOnLinksChanged( Context )( links );
    return (
        <SomeShit
            children={
                ( appState, stateDependentActions ) => React.createElement( Component, {...props, appState, stateDependentActions } )
            }
        />
    )
};

export const getAppStateAndActionsProvider = Context => (
class extends Component {
    setValueStoredOnLink = ( link ) => {};
    updateDataOnLink = ( link, calback ) => {
        this.setState( prevState => {
            calback( getValueFromLink( prevState, link ) )
            return prevState;
        });
    }
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
