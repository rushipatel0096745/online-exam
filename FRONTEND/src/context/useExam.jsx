import { createContext, useContext } from "react";

export const ExamContext = createContext();

export const ExamContextProvide = function({children}) {
    return (
        <ExamContext.Provider>
            {children}
        </ExamContext.Provider>
    )
}
