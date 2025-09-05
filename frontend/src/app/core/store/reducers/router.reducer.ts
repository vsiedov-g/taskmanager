import { routerReducer, RouterReducerState } from '@ngrx/router-store';

export interface RouterState extends RouterReducerState<any> {}

export { routerReducer };