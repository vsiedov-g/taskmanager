import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Board,
  BoardDetails,
  CreateBoardRequest,
  CreateBoardResponse,
  JoinBoardRequest,
  JoinBoardResponse
} from '../models/board.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private readonly apiUrl = `${environment.apiUrl}/boards`;

  constructor(private http: HttpClient) {}

  getUserBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(this.apiUrl);
  }

  getBoardDetails(id: string): Observable<BoardDetails> {
    return this.http.get<BoardDetails>(`${this.apiUrl}/${id}`);
  }

  createBoard(request: CreateBoardRequest): Observable<CreateBoardResponse> {
    return this.http.post<CreateBoardResponse>(this.apiUrl, request);
  }

  joinBoard(request: JoinBoardRequest): Observable<JoinBoardResponse> {
    return this.http.post<JoinBoardResponse>(`${this.apiUrl}/join`, request);
  }
}