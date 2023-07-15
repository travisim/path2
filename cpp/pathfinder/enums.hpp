#include <utility>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <memory>

#include "infotable.hpp"
#include "helper.hpp"

#ifndef ENUMS_HPP
#define ENUMS_HPP

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
    UnhighlightAllPseudoCodeRowSec,
    SetHighlightAtIndex,
    DrawVertex,
    DrawSingleVertex,
    EraseVertex,
    EraseAllVertex,
    DrawEdge,
    EraseEdge,
    EraseAllEdge,
    CreateStaticRow,
    RemoveStaticRow,
    EditStaticRow,
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
          INSERT_ELEMENT(EraseAllRows),             // dest, rowIndex
          INSERT_ELEMENT(UpdateRowAtIndex),            // dest, rowIndex
          INSERT_ELEMENT(HighlightPseudoCodeRowPri),   // highlight Pseudo
          INSERT_ELEMENT(HighlightPseudoCodeRowSec),   // highlight Pseudo
          INSERT_ELEMENT(UnhighlightPseudoCodeRowSec), // unhighlight Pseudo
          INSERT_ELEMENT(UnhighlightAllPseudoCodeRowSec), // unhighlight Pseudo
          INSERT_ELEMENT(SetHighlightAtIndex),
          INSERT_ELEMENT(DrawVertex);
          INSERT_ELEMENT(DrawSingleVertex),
          INSERT_ELEMENT(EraseVertex),
          INSERT_ELEMENT(EraseAllVertex),
          INSERT_ELEMENT(DrawEdge),
          INSERT_ELEMENT(EraseEdge),
          INSERT_ELEMENT(EraseAllEdge),
          INSERT_ELEMENT(CreateStaticRow),
          INSERT_ELEMENT(RemoveStaticRow),
          INSERT_ELEMENT(EditStaticRow);
#undef INSERT_ELEMENT
    }
    return out << myStrings[value];
  }

  enum Dest
  {
    Pseudocode,
    CanvasFocused,
    CanvasExpanded,
    CanvasPath,
    CanvasNeighbors,
    CanvasQueue,
    CanvasVisited,
    CanvasFCost,
    CanvasGCost,
    CanvasHCost,
    // SVGNode,
    // SVGVertex,
    ITNeighbors,
    ITQueue,
  };

  std::ostream &operator<<(std::ostream &out, const Dest value)
  {
    static std::map<Dest, std::string> myStrings;
    if (myStrings.size() == 0)
    {
#define INSERT_ELEMENT(p) myStrings[p] = #p
      INSERT_ELEMENT(Pseudocode),
      INSERT_ELEMENT(CanvasFocused),
      INSERT_ELEMENT(CanvasExpanded),
      INSERT_ELEMENT(CanvasPath),
      INSERT_ELEMENT(CanvasNeighbors),
      INSERT_ELEMENT(CanvasQueue),
      INSERT_ELEMENT(CanvasVisited),
      INSERT_ELEMENT(CanvasFCost),
      INSERT_ELEMENT(CanvasGCost),
      INSERT_ELEMENT(CanvasHCost),
      INSERT_ELEMENT(ITNeighbors),
      INSERT_ELEMENT(ITQueue);
#undef INSERT_ELEMENT
    }
    return out << myStrings[value];
  }

  enum costType
  {
    Euclidean,
    Manhattan,
    Chebyshev,
    Octile,
  };

  std::ostream &operator<<(std::ostream &out, const costType value)
  {
    static std::map<costType, std::string> myStrings;
    if (myStrings.size() == 0)
    {
#define INSERT_ELEMENT(p) myStrings[p] = #p
      INSERT_ELEMENT(Euclidean),
      INSERT_ELEMENT(Manhattan),
      INSERT_ELEMENT(Chebyshev),
      INSERT_ELEMENT(Octile);
#undef INSERT_ELEMENT
    }
    return out << myStrings[value];
  }

  enum timeOrder
  {
    FIFO,
    LIFO
  };

  std::ostream &operator<<(std::ostream &out, const timeOrder value)
  {
    static std::map<timeOrder, std::string> myStrings;
    if (myStrings.size() == 0)
    {
#define INSERT_ELEMENT(p) myStrings[p] = #p
      INSERT_ELEMENT(FIFO),
      INSERT_ELEMENT(LIFO);
#undef INSERT_ELEMENT
    }
    return out << myStrings[value];
  }


  template <typename Coord_t>
  struct BaseAction
  {
    using CoordType = Coord_t;
    // Command command;
    uint8_t command; // for binding
    // Dest dest;
    int8_t dest; // for binding
    Coord_t nodeCoord;
    int arrowIndex;
    double anyVal;
    BaseAction() {}
    BaseAction(Command command, int8_t dest, Coord_t nodeCoord, int arrowIndex,
           double anyVal)
        : command(command), dest(dest), nodeCoord(nodeCoord), arrowIndex(arrowIndex), anyVal(anyVal){ }
    friend std::ostream &operator<<(std::ostream &os, const BaseAction<Coord_t> &a){
      os<<"Command:         : "<<(Command)a.command<<std::endl;
      os<<"Dest:            : "<<a.dest<<std::endl;
      os<<"x,y              : "<<a.nodeCoord.first<<' '<<a.nodeCoord.second<<std::endl;
      os<<"arrowIndex       : "<<a.arrowIndex<<std::endl;
      os<<"anyVal           : "<<a.anyVal<<std::endl;
      return os;
    }
  };

  template <typename Coord_t>
  struct Action
  {
    using CoordType = Coord_t;
    // Command command;
    uint8_t command; // for binding
    // Dest dest;
    int8_t dest; // for binding
    Coord_t nodeCoord;
    int8_t colorIndex;
    int arrowIndex;
    int8_t pseudoCodeRow;
    int infoTableRowIndex;
    std::vector<std::string> infoTableRowData;
    double anyVal;
    Coord_t endCoord;
    Action() {}
    Action(Command command, int8_t dest, Coord_t nodeCoord, int colorIndex, int arrowIndex,
           int pseudoCodeRow, int infoTableRowIndex, std::vector<std::string> infoTableRowData,
           double anyVal, Coord_t endCoord)
        : command(command), dest(dest), nodeCoord(nodeCoord), colorIndex(colorIndex), arrowIndex(arrowIndex), pseudoCodeRow(pseudoCodeRow), infoTableRowIndex(infoTableRowIndex),
          infoTableRowData(infoTableRowData), anyVal(anyVal), endCoord(endCoord) {}
    friend std::ostream &operator<<(std::ostream &os, const Action<Coord_t> &a){
      os<<"Command:         : "<<(Command)a.command<<std::endl;
      os<<"Dest:            : "<<a.dest<<std::endl;
      os<<"x,y              : "<<a.nodeCoord.first<<' '<<a.nodeCoord.second<<std::endl;
      os<<"colorIndex       : "<<a.colorIndex<<std::endl;
      os<<"arrowIndex       : "<<a.arrowIndex<<std::endl;
      os<<"pseudoCodeRow    : "<<a.pseudoCodeRow<<std::endl;
      os<<"infoTableRowIndex: "<<a.infoTableRowIndex<<std::endl;
      os<<"infoTableRowData : [";
      for(const std::string &s : a.infoTableRowData) os<<s<<' ';
      os<<"]\n";
      os<<"anyVal          : "<<a.anyVal<<std::endl;
      os<<"endCoord         : "<<a.endCoord.first<<' '<<a.endCoord.second<<std::endl;
      return os;
    }
  };

  template <typename Action_t>
  struct Step
  {
    // can accept both regular actions and big-map actions
    std::vector<Action_t> fwdActions = {};
    std::vector<Action_t> revActions = {};
    bool combined = false;
    void addReverseAction(Action_t& revAction){
      revActions.push_back(revAction);
    }

    friend std::ostream &operator<<(std::ostream &os, const Step<Action_t> &s){
      os<<"\n-----------------------------FWD-----------------------------\n";
      for(const auto &a : s.fwdActions){
        os<<a<<std::endl;
      }
      // os<<"rev:\n";
      // for(const Action &a : s.revActions){
      //   os<<a<<std::endl;
      // }
      return os;
    }
  };

  // template <typename Coord_t>
  // struct FreeVertex{
  //   Coord_t xy;
  //   int colorIndex;  // can ignore in hashing because it has a tiny range (<10)
  //   double radius;
  // };
  // template <typename Coord_t>
  // inline bool operator==(const FreeVertex<Coord_t> &lhs, const FreeVertex<Coord_t> &rhs) {
  //   return isCoordEqual<Coord_t>(lhs.xy, rhs.xy) && lhs.colorIndex == rhs.colorIndex && lhs.radius == rhs.radius;
  // }

  // template <typename Coord_t>
  // struct VertexHash{
  //   std::size_t operator()(const FreeVertex<Coord_t>& v) const {
  //     auto radiusHash = std::hash<double>()(v.radius);
  //     auto hash = CoordHash<Coord_t>();
      
  //     // if constexpr(std::is_same<Coord_t, coordDouble_t>::value)
  //     //   return doubleHash(v.xy) ^ radiusHash;
  //     return hash(v.xy) ^ radiusHash;
  //   }
  // };

  // template <typename Coord_t>
  // struct FreeEdge{
  //   Coord_t startXY;
  //   Coord_t endXY;
  //   int colorIndex;  // similar to FreeVertex, can ignore in hashing because it has a tiny range (<10)
  //   double lineWidth;
  // };
  // template <typename Coord_t>
  // inline bool operator==(const FreeEdge<Coord_t> &lhs, const FreeEdge<Coord_t> &rhs) {
  //   return isCoordEqual<Coord_t>(lhs.startXY, rhs.startXY) && isCoordEqual<Coord_t>(lhs.endXY, rhs.endXY) && lhs.colorIndex == rhs.colorIndex && lhs.lineWidth == rhs.lineWidth;
  // }

  // template <typename Coord_t>
  // struct EdgeHash{
  //   std::size_t operator()(const FreeEdge<Coord_t>& e) const {
  //     auto lineWidthHash = std::hash<double>()(e.lineWidth);
  //     auto hash = CoordHash<Coord_t>();
  //     // if constexpr(std::is_same<Coord_t, coordDouble_t>::value)
  //     //   return doubleHash(e.startXY) ^ doubleHash(e.endXY) ^ lineWidthHash;
  //     // return coord2int32(e.startXY) ^ coord2int32(e.endXY) ^ lineWidthHash;
  //     return hash(e.startXY) ^ hash(e.endXY) ^ lineWidthHash;
  //   }
  // };

  template <typename Coord_t>
  struct State
  {
    // use int in favor of Dest because Dest is now planner-specific, so the enum is not visible to State
    bool valid = true;
    
    std::unordered_map<int, rowf_t> canvases;
    std::unordered_map<int, InfoTableState> infotables;
    std::unordered_map<int, std::vector<int>> vertices;
    std::unordered_map<int, std::vector<int>> edges;

    std::unordered_map<int, uint8_t> arrowColor;
    int pseudoCodeRowPri;
    int pseudoCodeRowSec;
  };

  template <typename Coord_t>
  struct RuntimeSimulation
  {
    // RuntimeSimulation keeps an active record of the current state of all items (canvases, infotables, single pixel values, arrows shown, bounds for values on canvas to track min and max values, vertices, edges)
    // use int in favor of Dest because Dest is now planner-specific, so the enum is not visible to RuntimeSimulation
    std::unordered_map<int, rowf_t> activeCanvas;
    std::unordered_map<int, std::unique_ptr<InfoTable>> activeTable;
    std::unordered_map<int, Coord_t> singlePixelCanvas;
    std::unordered_map<int, uint8_t> arrowColor;
    std::unordered_map<int, bound_t> bounds;
    std::unordered_map<int, std::unordered_set<int>> vertices;
    std::unordered_map<int, std::unordered_set<int>> edges;
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

template <typename Coord_t>
struct VertexSim{
  Coord_t nodeCoord;
  int8_t colorIndex;
  double radius;
  int arrowIndex;
};

template <typename Coord_t>
struct EdgeSim{
  Coord_t nodeCoord;
  Coord_t endCoord;
  int8_t colorIndex;
  double opacity;
  int arrowIndex;
};

template <typename Coord_t>
struct StoredVertex{
  Coord_t nodeCoord;
  int8_t colorIndex;
  double radius;
};

template <typename Coord_t>
struct StoredEdge{
  Coord_t nodeCoord;
  Coord_t endCoord;
  int8_t colorIndex;
  double opacity;
};

#endif