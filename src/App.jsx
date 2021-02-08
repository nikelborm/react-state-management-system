import React, { Component } from "react";
import createNewKit, { getValueFromLink } from "./Library";




const {
    AppStateAndActionsProvider: AppContextProvider,
    AppStateAndActionsConsumer: AppContextConsumer,
    getComponentSubscribedForLinks,
    getAppStateAndActionsConsumerThatRerendersOnlyWhenValuesOnLinksChanged: getAppContextConsumerSubscribedForLinks
} = createNewKit();

const regStatusLink = [ "isRegAllowed" ];


const RegistrationAvailabilityDependentUnsubscribedComponent = ({ appState }) => (
    <div>
        Registration status: {
            getValueFromLink( appState, regStatusLink ) /* isRegAllowed */
                ? "Available"
                : "Not available"
        }
    </div>
);
class RegistrationAvailabilityDependentUnsubscribedClassComponent extends Component {
    somethingElseFunctionality;
    render() {
        return (
            <div>
                Registration status: {
                    getValueFromLink( this.props.appState, regStatusLink ) /* isRegAllowed */
                        ? "Available"
                        : "Not available"
                }
            </div>
        );
    }
}
const RegistrationAvailabilityDependentComponent1 = getComponentSubscribedForLinks(
    RegistrationAvailabilityDependentUnsubscribedComponent,
    [ regStatusLink ]
);

const RegistrationAvailabilityDependentComponent2 = getComponentSubscribedForLinks(
    RegistrationAvailabilityDependentUnsubscribedClassComponent,
    [ regStatusLink ]
);


const AppContextConsumerSubscribedForRegStatus = getAppContextConsumerSubscribedForLinks( [ regStatusLink ] );
const RegistrationAvailabilityDependentComponent3 = () => (
    <AppContextConsumerSubscribedForRegStatus>
        { appState /* { ( { isRegAllowed } ) */ => <div>
            Registration status: {
                getValueFromLink( appState, regStatusLink ) /* isRegAllowed */
                    ? "Available"
                    : "Not available"
            }
        </div> }
    </AppContextConsumerSubscribedForRegStatus>
);


const RegistrationAvailabilityDependentComponent4 = () => (
    <AppContextConsumerSubscribedForRegStatus>
        { appState => RegistrationAvailabilityDependentUnsubscribedComponent( { appState } ) }
    </AppContextConsumerSubscribedForRegStatus>
);

const RegistrationAvailabilityDependentComponent5 = () => (
    <AppContextConsumerSubscribedForRegStatus>
        { appState => React.createElement(
            RegistrationAvailabilityDependentUnsubscribedComponent,
            { appState }
        ) }
    </AppContextConsumerSubscribedForRegStatus>
);

const RegistrationAvailabilityDependentComponent6 = () => (
    <AppContextConsumerSubscribedForRegStatus>
        { appState => React.createElement(
            RegistrationAvailabilityDependentUnsubscribedClassComponent,
            { appState }
        ) }
    </AppContextConsumerSubscribedForRegStatus>
);



class GlobalAppStateAndActionsProvider extends AppContextProvider {
    state = {
        isRegAllowed: false
    }
    actions = {
        revertRegStatus: () => this.setState( prevState => ({
            isRegAllowed: !prevState.isRegAllowed
        }) )
    }
    updaterq = () => {
        this.setState( () => ({
            isRegAllowed: true
        }) );
    };
    componentDidMount() {
        setInterval( this.updaterq, 5000 );
    }
}
function App() {
    return (
        <div>
            <GlobalAppStateAndActionsProvider>
                <RegistrationAvailabilityDependentComponent1/>
                <RegistrationAvailabilityDependentComponent2/>
                asdasd
            </GlobalAppStateAndActionsProvider>
        </div>
    );
}

export default App;
