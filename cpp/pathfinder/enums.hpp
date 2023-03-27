#include <utility>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <memory>

#include "infotable.hpp"

#ifndef ENUMS_HPP
#define ENUMS_HPP

//#define STEP_STRUCT_METHOD
//#define CANVAS_GRID

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
    // Command command;
    int command; // for binding
    // Dest dest;
    int dest; // for binding
    coord_t nodeCoord;
    int colorIndex;
    int arrowIndex;
    int pseudoCodeRow;
    int infoTableRowIndex;
    std::vector<std::string> infoTableRowData;
    double cellVal;
    coord_t endCoord;
    Action() {}
    Action(Command command, Dest dest, coord_t nodeCoord, int colorIndex, int arrowIndex,
           int pseudoCodeRow, int infoTableRowIndex, std::vector<std::string> infoTableRowData,
           double cellVal, coord_t endCoord)
        : command(command), dest(dest), nodeCoord(nodeCoord), colorIndex(colorIndex), arrowIndex(arrowIndex), pseudoCodeRow(pseudoCodeRow), infoTableRowIndex(infoTableRowIndex),
          infoTableRowData(infoTableRowData), cellVal(cellVal), endCoord(endCoord) {}
  };
#else

  struct Action{
    std::vector<int> data;
    std::vector<std::string> infoTableRowData;
    double cellVal;
  };

#endif

  struct Step
  {
    // std::vector<std::unique_ptr<Action>> fwdActions = {};
    // std::vector<std::unique_ptr<Action>> revActions = {};

    std::vector<Action> fwdActions = {};
    std::vector<Action> revActions = {};
    bool combined = false;
  };

  struct State
  {
    // int is used in favour of Dest because
    // implicit type conversion works 
    // and there is no need to bind the enum Dest to emscripten (see wrapper.h)
    bool valid = true;
    /* std::unordered_map<Dest, state_canvas_t> canvases;
    std::unordered_map<Dest, InfoTableState> infotables;
    std::unordered_map<Dest, std::vector<coord_t>> vertices;
    std::unordered_map<Dest, std::vector<line_t>> edges; */
#ifdef CANVAS_GRID
    std::unordered_map<int, gridf_t> canvases;
#else
    std::unordered_map<int, state_canvas_t> canvases;
#endif
    std::unordered_map<int, InfoTableState> infotables;
    std::unordered_map<int, std::vector<coord_t>> vertices;
    std::unordered_map<int, std::vector<line_t>> edges;
    std::unordered_map<int, int> arrowColor;
    int pseudoCodeRowPri;
    int pseudoCodeRowSec;
  };

  struct RuntimeSimulation
  {
    // RuntimeSimulation keeps an active record of the current state of all items (canvases, infotables, single pixel values, arrows shown, bounds for values on canvas to track min and max values, vertices, edges)

#ifdef CANVAS_GRID
    std::unordered_map<Dest, gridf_t> activeCanvas;
#else
    std::unordered_map<Dest, state_canvas_t> activeCanvas;
#endif
    std::unordered_map<Dest, std::unique_ptr<InfoTable>> activeTable;
    std::unordered_map<Dest, coord_t> singlePixelCanvas;
    std::unordered_map<int, int> arrowColor;
    // std::unordered_map<Dest, std::pair<double, double>> bounds;
    std::unordered_map<int, std::pair<double, double>> bounds;

    std::unordered_map<Dest,
                       std::unordered_set<
                           coord_t,
                           CoordIntHash>>
        vertices;
    // Hash function
    struct hashFunctionEdges
    {
      size_t operator()(const std::array<int,
                                         4> &x) const
      {
        return x[0] ^ x[1] ^ x[2] ^ x[3];
      }
    };
    std::unordered_map<Dest,
                       std::unordered_set<
                           line_t,
                           hashFunctionEdges>>
        edges;
    int pseudoCodeRowPri = -1;
    int pseudoCodeRowSec = -1;
    void clear()
    {
      activeCanvas.clear();
      activeTable.clear();
      singlePixelCanvas.clear();
      arrowColor.clear();
      bounds.clear();
      vertices.clear();
      edges.clear();
    }
  };
}
#endif