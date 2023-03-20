#include <utility>
#include <vector>
#include <unordered_map>
#include <memory>

#include "infotable.hpp"

#ifndef ENUMS_HPP
#define ENUMS_HPP

#define STEP_STRUCT_METHOD

namespace pathfinder
{

  enum NWSE
  {
    N,
    W,
    S,
    E,
    NW,
    SW,
    SE,
    NE,
    nil,
  };

  enum Command
  {
    DrawSinglePixel,
    SetPixel,
    EraseCanvas,                 // erase canvas
    DrawPixel,                   // draw pixel
    ErasePixel,                  // erase pixel
    IncrementPixel,              // increment pixel
    DecrementPixel,              // increment pixel
    DrawArrow,                   // draw arrow (arrow index) [colour index]
    EraseArrow,                  // erase arrow (arrow index)
    InsertRowAtIndex,            // dest, rowIndex
    EraseRowAtIndex,             // dest, rowIndex
    EraseAllRows,                // dest, rowIndex
    UpdateRowAtIndex,            // dest, rowIndex
    HighlightPseudoCodeRowPri,   // highlight Pseudo
    HighlightPseudoCodeRowSec,   // highlight Pseudo
    UnhighlightPseudoCodeRowSec, // unhighlight Pseudo
    SetHighlightAtIndex,
    DrawVertex,
    DrawSingleVertex,
    EraseVertex,
    EraseAllVertex,
    DrawEdge,
    EraseEdge,
    EraseAllEdge,
  };

  enum Dest
  {
    Pseudocode,
    CanvasQueue,
    CanvasVisited,
    CanvasExpanded,
    CanvasNeigbors,
    CanvasPath,
    CanvasFocused,
    CanvasFCost,
    CanvasGCost,
    CanvasHCost,
    ITQueue,
    ITNeighbors,
    map
  };

  std::ostream &operator<<(std::ostream &out, const Command value)
  {
    static std::map<Command, std::string> myStrings;
    if (myStrings.size() == 0)
    {
#define INSERT_ELEMENT(p) myStrings[p] = #p
      INSERT_ELEMENT(DrawSinglePixel),
          INSERT_ELEMENT(SetPixel),
          INSERT_ELEMENT(EraseCanvas),                 // erase canvas
          INSERT_ELEMENT(DrawPixel),                   // draw pixel
          INSERT_ELEMENT(ErasePixel),                  // erase pixel
          INSERT_ELEMENT(IncrementPixel),              // increment pixel
          INSERT_ELEMENT(DecrementPixel),              // increment pixel
          INSERT_ELEMENT(DrawArrow),                   // draw arrow (arrow index) [colour index]
          INSERT_ELEMENT(EraseArrow),                  // erase arrow (arrow index)
          INSERT_ELEMENT(InsertRowAtIndex),            // dest, rowIndex
          INSERT_ELEMENT(EraseRowAtIndex),             // dest, rowIndex
          INSERT_ELEMENT(UpdateRowAtIndex),            // dest, rowIndex
          INSERT_ELEMENT(HighlightPseudoCodeRowPri),   // highlight Pseudo
          INSERT_ELEMENT(HighlightPseudoCodeRowSec),   // highlight Pseudo
          INSERT_ELEMENT(UnhighlightPseudoCodeRowSec), // unhighlight Pseudo
          INSERT_ELEMENT(SetHighlightAtIndex),
          INSERT_ELEMENT(DrawVertex);
#undef INSERT_ELEMENT
    }
    return out << myStrings[value];
  }

  std::ostream &operator<<(std::ostream &out, const Dest value)
  {
    static std::map<Dest, std::string> myStrings;
    if (myStrings.size() == 0)
    {
#define INSERT_ELEMENT(p) myStrings[p] = #p
      INSERT_ELEMENT(Pseudocode),
          INSERT_ELEMENT(CanvasQueue),
          INSERT_ELEMENT(CanvasVisited),
          INSERT_ELEMENT(CanvasExpanded),
          INSERT_ELEMENT(CanvasNeigbors),
          INSERT_ELEMENT(CanvasPath),
          INSERT_ELEMENT(CanvasFocused),
          INSERT_ELEMENT(CanvasFCost),
          INSERT_ELEMENT(CanvasGCost),
          INSERT_ELEMENT(CanvasHCost),
          INSERT_ELEMENT(ITQueue),
          INSERT_ELEMENT(ITNeighbors),
          INSERT_ELEMENT(map);
#undef INSERT_ELEMENT
    }
    return out << myStrings[value];
  }

  enum costType
  {
    Manhattan,
    Euclidean,
    Chebyshev,
    Octile,
  };

  enum timeOrder
  {
    FIFO,
    LIFO
  };

#ifdef STEP_STRUCT_METHOD

  struct Action
  {
    Command command;
    Dest dest;
    std::pair<int, int> nodeCoord;
    int colorIndex;
    int arrowIndex;
    int pseudoCodeRow;
    int infoTableRowIndex;
    std::vector<std::string> infoTableRowData;
    double cellVal;
    std::pair<int, int> endCoord;
    Action(Command command, Dest dest, std::pair<int, int> nodeCoord, int colorIndex, int arrowIndex,
           int pseudoCodeRow, int infoTableRowIndex, std::vector<std::string> infoTableRowData,
           int cellVal, std::pair<int, int> endCoord)
        : command(command), dest(dest), nodeCoord(nodeCoord), colorIndex(colorIndex), arrowIndex(arrowIndex), pseudoCodeRow(pseudoCodeRow), infoTableRowIndex(infoTableRowIndex),
          infoTableRowData(infoTableRowData), cellVal(cellVal), endCoord(endCoord) {}
  };

  struct Step
  {
    std::vector<std::unique_ptr<Action>> fwdActions;
    std::vector<std::unique_ptr<Action>> revActions;
    bool combined;
  };
#endif

  struct InfoTableState{
    const int rowSize;
    int highlightedRow;
    std::vector<int> data;
  };

  struct State
  {
    std::unordered_map<Dest, grid_t> canvas;
    std::unordered_map<Dest, InfoTableState> infotables;
    std::unordered_map<Dest, std::vector<std::pair<int, int>>> vertices;
    std::unordered_map<Dest, std::vector<std::array<int, 4>>> arrowCoords;
  };

  struct RuntimeSimulation{
    // RuntimeSimulation keeps an active record of the current state of all items (canvases, infotables, single pixel values, arrows shown, bounds for values on canvas to track min and max values, vertices, edges)
    std::unordered_map<Dest, grid_t> activeCanvas;
    std::unordered_map<Dest, InfoTable> activeTable;
    std::unordered_map<Dest, std::pair<int, int>> singlePixelCanvas;
    std::unordered_map<int, int> arrowIndex;
    std::unordered_map<Dest, std::pair<double, double>> bounds;
    std::unordered_map<Dest, std::vector<std::pair<int, int>>> vertices;
    std::unordered_map<Dest, std::vector<std::array<int, 4>>> edges;
    void clear(){
      activeCanvas.clear();
      activeTable.clear();
      singlePixelCanvas.clear();
      arrowIndex.clear();
      bounds.clear();
      vertices.clear();
      edges.clear();
    }
  };
}
#endif