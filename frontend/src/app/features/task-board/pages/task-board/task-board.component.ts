import { Component, OnInit, OnDestroy, inject, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, take, filter } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

import { AuthService, User } from '../../../../core/services/auth.service';

import { Task, TaskStatus } from '../../models/task.model';
import { List, ListColumn, CreateListRequest } from '../../models/list.model';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { CardCreationModalComponent } from '../../components/card-creation-modal/card-creation-modal.component';
import { CardEditModalComponent } from '../../components/card-edit-modal/card-edit-modal.component';
import { HistorySidebarComponent } from '../../components/history-sidebar/history-sidebar.component';
import { 
  TaskActions, 
  selectTasksLoading, 
  selectTasksError,
  selectTaskEntitiesFromState,
  ListActions,
  selectListColumns,
  selectListsLoading,
  selectListsError,
  selectIsAddingList,
  selectIsBoardEmpty,
  selectEditingListId,
  selectIsCreateCardModalOpen,
  selectIsEditCardModalOpen,
  selectEditingTask,
  selectSortedLists
} from '../../store';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskCardComponent, CardCreationModalComponent, CardEditModalComponent, HistorySidebarComponent],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.scss'
})
export class TaskBoardComponent implements OnInit, OnDestroy {
  @ViewChild('boardContainer', { static: false }) boardContainer!: ElementRef<HTMLDivElement>;
  
  private store = inject(Store);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  
  // Observables
  listColumns$: Observable<ListColumn[]>;
  tasksLoading$: Observable<boolean>;
  tasksError$: Observable<string | null>;
  listsLoading$: Observable<boolean>;
  listsError$: Observable<string | null>;
  isAddingList$: Observable<boolean>;
  isBoardEmpty$: Observable<boolean>;
  editingListId$: Observable<string | null>;
  isCreateCardModalOpen$: Observable<boolean>;
  isEditCardModalOpen$: Observable<boolean>;
  editingTask$: Observable<Task | null>;
  sortedLists$: Observable<List[]>;
  
  // List creation state
  newListTitle = '';
  
  // Context menu state
  showContextMenu: string | null = null;
  
  // Drag and drop state
  isDragOverList: string | null = null;
  draggedTask: Task | null = null;
  
  // Auto-scroll during drag
  private dragScrollInterval: any = null;
  private readonly SCROLL_SPEED = 3;
  private readonly SCROLL_ZONE_SIZE = 100;
  
  // Visual feedback for scroll zones
  showLeftScrollZone = false;
  showRightScrollZone = false;
  
  // List drag and drop state
  draggedList: string | null = null;
  isDragOverPosition: number | null = null;  // For precision drop zones between lists
  dragOverListIndex: number | null = null;   // For easy drop zones on list containers
  dragPreviewElement: HTMLElement | null = null;
  
  // History sidebar state
  isHistorySidebarOpen = false;
  
  // List columns count for drag and drop
  listColumnsCount = 0;
  
  // Enum reference for template
  TaskStatus = TaskStatus;
  
  constructor() {
    // Initialize observables
    this.listColumns$ = this.store.select(selectListColumns);
    this.tasksLoading$ = this.store.select(selectTasksLoading);
    this.tasksError$ = this.store.select(selectTasksError);
    this.listsLoading$ = this.store.select(selectListsLoading);
    this.listsError$ = this.store.select(selectListsError);
    this.isAddingList$ = this.store.select(selectIsAddingList);
    this.isBoardEmpty$ = this.store.select(selectIsBoardEmpty);
    this.editingListId$ = this.store.select(selectEditingListId);
    this.isCreateCardModalOpen$ = this.store.select(selectIsCreateCardModalOpen);
    this.isEditCardModalOpen$ = this.store.select(selectIsEditCardModalOpen);
    this.editingTask$ = this.store.select(selectEditingTask);
    this.sortedLists$ = this.store.select(selectSortedLists);
  }

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });

    // Load lists and tasks on component initialization
    this.store.dispatch(ListActions.loadLists());
    this.store.dispatch(TaskActions.loadTasks());
    
    // Check for task ID parameter and open modal if present
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const taskId = params.get('id');
      if (taskId) {
        // Wait for tasks to load and not be loading, then find and open the task
        combineLatest([
          this.store.select(selectTaskEntitiesFromState),
          this.store.select(selectTasksLoading)
        ]).pipe(
          filter(([entities, loading]: [any, boolean]) => !loading && Object.keys(entities).length > 0),
          take(1),
          takeUntil(this.destroy$)
        ).subscribe(([taskEntities, loading]: [any, boolean]) => {
          const task = taskEntities[taskId];
          if (task) {
            // Open the task modal but keep the URL with task ID
            this.store.dispatch(TaskActions.openEditCardModal({ task }));
          } else {
            // Task not found after loading completed, navigate back to task-board
            console.warn(`Task with ID ${taskId} not found`);
            this.router.navigate(['/task-board'], { replaceUrl: true });
          }
        });
      }
    });
    
    // Subscribe to list columns to track count
    this.listColumns$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(columns => {
      this.listColumnsCount = columns.length;
    });
  }

  ngOnDestroy(): void {
    // Clean up drag scroll monitoring
    this.stopDragScrollMonitoring();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTaskStatusChanged(event: { taskId: string, newStatus: TaskStatus }): void {
    this.store.dispatch(TaskActions.updateTaskStatus({ 
      id: event.taskId, 
      status: event.newStatus 
    }));
  }

  onTaskListChanged(event: { taskId: string, newListId: string }): void {
    this.store.dispatch(TaskActions.updateTask({
      id: event.taskId,
      changes: { listId: event.newListId }
    }));
  }

  getAvailableStatuses(currentStatus: TaskStatus): TaskStatus[] {
    return Object.values(TaskStatus)
      .filter(value => typeof value === 'number')
      .filter(status => status !== currentStatus) as TaskStatus[];
  }

  onAddNewCard(listId: string): void {
    this.store.dispatch(TaskActions.openCreateCardModal({ listId }));
  }

  onCardClicked(task: Task): void {
    // Navigate to the task route which will trigger the modal opening
    this.router.navigate(['/task', task.id]);
  }

  // Helper method to refresh tasks manually if needed
  onRefreshTasks(): void {
    this.store.dispatch(TaskActions.refreshTasks());
  }

  // List creation methods
  onStartAddingList(): void {
    this.store.dispatch(ListActions.startAddingList());
    this.newListTitle = '';
    
    // Focus the input field after the view updates
    setTimeout(() => {
      const input = document.querySelector('input[placeholder="Enter list title..."]') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 0);
  }

  onCancelAddingList(): void {
    this.store.dispatch(ListActions.cancelAddingList());
    this.newListTitle = '';
  }

  onSaveNewList(): void {
    if (this.newListTitle.trim()) {
      // Get current lists to calculate next position
      this.sortedLists$.pipe(
        take(1)
      ).subscribe(currentLists => {
        const nextPosition = currentLists.length > 0 
          ? Math.max(...currentLists.map(list => list.position)) + 1 
          : 0;

        const listData: CreateListRequest = {
          name: this.newListTitle.trim(),
          position: nextPosition
        };
        
        this.store.dispatch(ListActions.createList({ listData }));
        
        // Scroll to show the newly added list
        this.scrollToEnd();
      });
      
      this.newListTitle = '';
    }
  }

  onNewListKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSaveNewList();
    } else if (event.key === 'Escape') {
      this.onCancelAddingList();
    }
  }

  // List management methods
  onEditList(listId: string): void {
    this.store.dispatch(ListActions.startEditingList({ id: listId }));
  }

  onSaveEditList(listId: string, newName: string): void {
    if (newName.trim()) {
      this.store.dispatch(ListActions.updateList({ 
        listData: { id: listId, name: newName.trim() } 
      }));
    }
  }

  onCancelEditList(): void {
    this.store.dispatch(ListActions.cancelEditingList());
  }

  onDeleteList(listId: string): void {
    // TODO: Add confirmation dialog
    this.store.dispatch(ListActions.deleteList({ id: listId }));
  }

  // Helper methods
  trackByListId(index: number, list: ListColumn): string {
    return list.id;
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  // Context menu methods
  toggleContextMenu(listId: string, event: Event): void {
    event.stopPropagation();
    this.showContextMenu = this.showContextMenu === listId ? null : listId;
  }

  hideContextMenu(): void {
    this.showContextMenu = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isContextMenuButton = target.closest('[id^="menu-button-"]');
    const isContextMenu = target.closest('.absolute.right-0.top-8');
    
    if (!isContextMenuButton && !isContextMenu) {
      this.hideContextMenu();
    }
  }

  // Drag and drop handlers
  onTaskDragStart(event: { task: Task, event: DragEvent }): void {
    this.draggedTask = event.task;
    // Start monitoring mouse position for auto-scroll
    this.startDragScrollMonitoring();
  }

  onTaskDragEnd(event: { task: Task, event: DragEvent }): void {
    this.draggedTask = null;
    this.isDragOverList = null;
    // Stop auto-scroll monitoring
    this.stopDragScrollMonitoring();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDragEnter(event: DragEvent, listId: string): void {
    event.preventDefault();
    
    // Only highlight for task drops, not list drops
    const dragData = this.getDragData(event);
    if (dragData?.type !== 'list') {
      this.isDragOverList = listId;
    }
  }

  onDragLeave(event: DragEvent, listId: string): void {
    // Only clear if we're actually leaving the list area
    const target = event.relatedTarget as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;
    
    if (!currentTarget.contains(target)) {
      this.isDragOverList = null;
    }
  }

  onDrop(event: DragEvent, targetListId: string): void {
    event.preventDefault();
    this.isDragOverList = null;

    try {
      const dragData = JSON.parse(event.dataTransfer!.getData('text/plain'));
      
      // Handle list drops - ignore them here, they should use list drop zones
      if (dragData.type === 'list') {
        return;
      }
      
      const { taskId, fromListId } = dragData;

      // Don't do anything if dropped on the same list
      if (fromListId === targetListId) {
        return;
      }

      // Dispatch the move action using the specialized move endpoint
      this.store.dispatch(TaskActions.moveTask({
        id: taskId,
        listId: targetListId,
        position: 0 // Position at top of list for now
      }));

    } catch (error) {
      console.error('Error processing drop:', error);
    }
  }

  // List drag and drop handlers
  onListDragStart(event: DragEvent, listId: string): void {
    this.draggedList = listId;
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', JSON.stringify({ listId, type: 'list' }));
    
    // Create drag image from the list element
    const listElement = (event.target as HTMLElement).closest('.list-column') as HTMLElement;
    if (listElement) {
      this.dragPreviewElement = listElement.cloneNode(true) as HTMLElement;
      this.dragPreviewElement.style.transform = 'rotate(5deg)';
      this.dragPreviewElement.style.opacity = '0.8';
      document.body.appendChild(this.dragPreviewElement);
      event.dataTransfer!.setDragImage(this.dragPreviewElement, 0, 0);
    }
    
    // Add dragging class for visual feedback
    if (listElement) {
      listElement.classList.add('dragging');
    }
  }

  onListDragEnd(event: DragEvent): void {
    this.draggedList = null;
    this.isDragOverPosition = null;
    this.dragOverListIndex = null;
    
    // Clean up drag preview
    if (this.dragPreviewElement) {
      document.body.removeChild(this.dragPreviewElement);
      this.dragPreviewElement = null;
    }
    
    // Remove dragging class
    const listElement = (event.target as HTMLElement).closest('.list-column') as HTMLElement;
    if (listElement) {
      listElement.classList.remove('dragging');
    }
  }

  onListDropZoneEnter(event: DragEvent, targetPosition: number): void {
    event.preventDefault();
    const dragData = this.getDragData(event);
    if (dragData?.type === 'list') {
      this.isDragOverPosition = targetPosition;
    }
  }

  onListDropZoneLeave(event: DragEvent): void {
    // Only clear if we're actually leaving the drop zone
    const target = event.relatedTarget as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;
    
    if (!currentTarget.contains(target)) {
      this.isDragOverPosition = null;
    }
  }

  onListDrop(event: DragEvent, targetPosition: number): void {
    event.preventDefault();
    this.isDragOverPosition = null;

    try {
      const dragData = JSON.parse(event.dataTransfer!.getData('text/plain'));
      if (dragData.type !== 'list') {
        return;
      }

      const { listId } = dragData;
      
      // Use shared reorder logic for precision drops (between lists)
      this.handleListReorder(listId, targetPosition);

    } catch (error) {
      console.error('Error processing list drop:', error);
    }
  }

  // List container drop handlers (for easy drops)
  onListContainerEnter(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    const dragData = this.getDragData(event);
    
    // Only respond to list drag operations
    if (dragData?.type === 'list') {
      this.dragOverListIndex = targetIndex;
      // Clear precision drop zone highlighting
      this.isDragOverPosition = null;
    }
  }

  onListContainerLeave(event: DragEvent, targetIndex: number): void {
    // Only clear if we're actually leaving the container
    const target = event.relatedTarget as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;
    
    if (!currentTarget.contains(target)) {
      this.dragOverListIndex = null;
    }
  }

  onListContainerDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    this.dragOverListIndex = null;

    try {
      const dragData = JSON.parse(event.dataTransfer!.getData('text/plain'));
      if (dragData.type !== 'list') {
        return;
      }

      const { listId } = dragData;
      
      // Insert BEFORE the target list (this is the key difference from precision drops)
      this.handleListReorder(listId, targetIndex);

    } catch (error) {
      console.error('Error processing list container drop:', error);
    }
  }

  // Common list reorder logic
  private handleListReorder(draggedListId: string, targetPosition: number): void {
    // Get current lists to calculate new positions
    this.sortedLists$.pipe(
      take(1)
    ).subscribe(currentLists => {
      const draggedListIndex = currentLists.findIndex(list => list.id === draggedListId);
      if (draggedListIndex === -1) return;

      // Don't move if dropping in the same position
      if (draggedListIndex === targetPosition || draggedListIndex === targetPosition - 1) {
        return;
      }

      // Calculate new positions for all affected lists
      const updatedLists = [...currentLists];
      const [draggedList] = updatedLists.splice(draggedListIndex, 1);
      updatedLists.splice(targetPosition, 0, draggedList);

      // Update positions
      const listUpdates = updatedLists.map(list => list.id);

      // Dispatch bulk position update
      this.store.dispatch(ListActions.reorderLists({ 
        listIds: listUpdates
      }));
    });
  }

  private getDragData(event: DragEvent): any {
    try {
      return JSON.parse(event.dataTransfer!.getData('text/plain'));
    } catch {
      return null;
    }
  }

  // History sidebar methods
  onOpenHistorySidebar(): void {
    this.isHistorySidebarOpen = true;
  }

  onCloseHistorySidebar(): void {
    this.isHistorySidebarOpen = false;
  }

  // Horizontal scroll support with mouse wheel
  onBoardWheel(event: WheelEvent): void {
    // Only handle horizontal scrolling if not already scrolling horizontally
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      
      const container = this.boardContainer.nativeElement;
      const scrollAmount = event.deltaY > 0 ? 100 : -100;
      
      container.scrollBy({
        left: scrollAmount
      });
    }
  }

  // Scroll to show newly added list
  scrollToEnd(): void {
    if (this.boardContainer?.nativeElement) {
      const container = this.boardContainer.nativeElement;
      setTimeout(() => {
        container.scrollTo({
          left: container.scrollWidth
        });
      }, 100);
    }
  }

  // Auto-scroll during drag operations
  private startDragScrollMonitoring(): void {
    this.dragScrollInterval = setInterval(() => {
      if (!this.draggedTask || !this.boardContainer?.nativeElement) {
        return;
      }

      const container = this.boardContainer.nativeElement;
      const containerRect = container.getBoundingClientRect();
      
      // Get current mouse position (stored during drag events)
      const mouseX = this.currentMouseX;
      
      if (mouseX !== undefined) {
        const leftEdge = containerRect.left;
        const rightEdge = containerRect.right;
        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth;
        const containerWidth = container.clientWidth;
        
        // Update visual indicators
        this.showLeftScrollZone = mouseX < leftEdge + this.SCROLL_ZONE_SIZE && scrollLeft > 0;
        this.showRightScrollZone = mouseX > rightEdge - this.SCROLL_ZONE_SIZE && scrollLeft < scrollWidth - containerWidth;
        
        // Check if mouse is in left scroll zone
        if (this.showLeftScrollZone) {
          container.scrollLeft = Math.max(0, scrollLeft - this.SCROLL_SPEED * 5);
        }
        // Check if mouse is in right scroll zone
        else if (this.showRightScrollZone) {
          container.scrollLeft = Math.min(scrollWidth - containerWidth, scrollLeft + this.SCROLL_SPEED * 5);
        }
      }
    }, 16); // ~60fps
  }

  private stopDragScrollMonitoring(): void {
    if (this.dragScrollInterval) {
      clearInterval(this.dragScrollInterval);
      this.dragScrollInterval = null;
    }
    this.currentMouseX = undefined;
    // Hide scroll zone indicators
    this.showLeftScrollZone = false;
    this.showRightScrollZone = false;
  }

  // Track mouse position during drag
  private currentMouseX: number | undefined;
  
  @HostListener('window:dragover', ['$event'])
  onWindowDragOver(event: DragEvent): void {
    if (this.draggedTask) {
      this.currentMouseX = event.clientX;
    }
  }

  // Authentication methods
  onSignOut(): void {
    this.authService.signOut();
    this.router.navigate(['/auth/sign-in']);
  }

}