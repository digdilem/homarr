import { GridStack, GridStackNode } from 'fily-publish-gridstack';
import { MutableRefObject, RefObject } from 'react';
import { AppType } from '../../../../types/app';
import { IWidget } from '../../../../widgets/widgets';

export const initializeGridstack = (
  areaType: 'wrapper' | 'category' | 'sidebar',
  wrapperRef: RefObject<HTMLDivElement>,
  gridRef: MutableRefObject<GridStack | undefined>,
  itemRefs: MutableRefObject<Record<string, RefObject<HTMLDivElement>>>,
  areaId: string,
  items: AppType[],
  widgets: IWidget<string, any>[],
  isEditMode: boolean,
  wrapperColumnCount: 3 | 6 | 12,
  events: {
    onChange: (changedNode: GridStackNode) => void;
    onAdd: (addedNode: GridStackNode) => void;
  }
) => {
  if (!wrapperRef.current) return;
  // calculates the currently available count of columns
  const columnCount = areaType === 'sidebar' ? 2 : wrapperColumnCount;
  const minRow = areaType !== 'sidebar' ? 1 : Math.floor(wrapperRef.current.offsetHeight / 64);
  // initialize gridstack
  const newGrid = gridRef;
  newGrid.current = GridStack.init(
    {
      column: columnCount,
      margin: 10,
      cellHeight: 64,
      float: true,
      alwaysShowResizeHandle: 'mobile',
      acceptWidgets: true,
      disableOneColumnMode: true,
      staticGrid: !isEditMode,
      minRow,
      animate: false,
    },
    // selector of the gridstack item (it's eather category or wrapper)
    `.grid-stack-${areaType}[data-${areaType}='${areaId}']`
  );
  const grid = newGrid.current;
  // Must be used to update the column count after the initialization
  grid.column(columnCount);

  // Add listener for moving items around in a wrapper
  grid.on('change', (_, el) => {
    const nodes = el as GridStackNode[];
    const firstNode = nodes.at(0);
    if (!firstNode) return;
    events.onChange(firstNode);
  });

  // Add listener for moving items in config from one wrapper to another
  grid.on('added', (_, el) => {
    const nodes = el as GridStackNode[];
    const firstNode = nodes.at(0);
    if (!firstNode) return;
    events.onAdd(firstNode);
  });

  grid.batchUpdate();
  grid.removeAll(false);
  items.forEach(
    ({ id }) => {
      const item = itemRefs.current[id]?.current;
      item && grid.makeWidget(item as HTMLDivElement);
    }
  );
  widgets.forEach(
    ({ id }) => {
      const item = itemRefs.current[id]?.current;
      item && grid.makeWidget(item as HTMLDivElement);
    }
  );
  grid.batchUpdate(false);
};
