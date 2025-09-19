'use client';

import React, { createContext, useContext, useReducer } from "react";
import reducer, { initialState } from './reducer';

//prepares the data layer 
export const StateContext = createContext();

// Wrap our app and provide the data layer
export const StateProvider = ({ children }) => (
    <StateContext.Provider value={useReducer(reducer, initialState)}>
        {children}
    </StateContext.Provider>
);

// Pull information from the data layer
export const useStateValue = () => useContext(StateContext);
