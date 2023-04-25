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
    CanvasFocused,
    CanvasExpanded,
    CanvasPath,
    CanvasNeighbors,
    CanvasQueue,
    CanvasVisited,
    CanvasFCost,
    CanvasGCost,
    CanvasHCost,
    ITNeighbors,
    ITQueue,
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


  struct BaseAction
  {
    // Command command;
    int8_t command; // for binding
    // Dest dest;
    int8_t dest; // for binding
    coord_t nodeCoord;
    double cellVal;
    BaseAction() {}
    BaseAction(Command command, Dest dest, coord_t nodeCoord,
           double cellVal)
        : command(command), dest(dest), nodeCoord(nodeCoord), cellVal(cellVal) {}
    friend std::ostream &operator<<(std::ostream &os, const BaseAction &a);
  };

  std::ostream &operator<<(std::ostream &os, const BaseAction &a){
    os<<"Command:         : "<<(Command)a.command<<std::endl;
    os<<"Dest:            : "<<(Dest)a.dest<<std::endl;
    os<<"x,y              : "<<a.nodeCoord.first<<' '<<a.nodeCoord.second<<std::endl;
    os<<"cellVal          : "<<a.cellVal<<std::endl;
    return os;
  }

  struct Action
  {
    // Command command;
    int8_t command; // for binding
    // Dest dest;
    int8_t dest; // for binding
    coord_t nodeCoord;
    int8_t colorIndex;
    int arrowIndex;
    int8_t pseudoCodeRow;
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
    friend std::ostream &operator<<(std::ostream &os, const Action &a);
  };

  std::ostream &operator<<(std::ostream &os, const Action &a){
    os<<"Command:         : "<<(Command)a.command<<std::endl;
    os<<"Dest:            : "<<(Dest)a.dest<<std::endl;
    os<<"x,y              : "<<a.nodeCoord.first<<' '<<a.nodeCoord.second<<std::endl;
    os<<"colorIndex       : "<<a.colorIndex<<std::endl;
    os<<"arrowIndex       : "<<a.arrowIndex<<std::endl;
    os<<"pseudoCodeRow    : "<<a.pseudoCodeRow<<std::endl;
    os<<"infoTableRowIndex: "<<a.infoTableRowIndex<<std::endl;
    os<<"infoTableRowData : [";
    for(const std::string &s : a.infoTableRowData){
      os<<s<<' ';
    }
    os<<"]\n";
    os<<"cellVal          : "<<a.cellVal<<std::endl;
    os<<"endCoord         : "<<a.endCoord.first<<' '<<a.endCoord.second<<std::endl;
    return os;
  }

  // struct BigMapStep
  // {
  //   // can accept both regular actions and big-map actions
  //   std::vector<BigMapAction> fwdActions = {};
  //   std::vector<BigMapAction> revActions = {};
  //   bool combined = false;
  //   void addReverseAction(BigMapAction revAction){
  //     revActions.push_back(revAction);
  //   }

  //   friend std::ostream &operator<<(std::ostream &os, const BigMapStep &s);
  // };

  // std::ostream &operator<<(std::ostream &os, const BigMapStep &s){
  //   os<<"\n-----------------------------FWD-----------------------------\n";
  //   for(const auto &a : s.fwdActions){
  //     os<<a<<std::endl;
  //   }
  //   // os<<"rev:\n";
  //   // for(const Action &a : s.revActions){
  //   //   os<<a<<std::endl;
  //   // }
  //   return os;
  // }

  template <typename Action_t>
  struct Step
  {
    // can accept both regular actions and big-map actions
    std::vector<Action_t> fwdActions = {};
    std::vector<Action_t> revActions = {};
    bool combined = false;
    void addReverseAction(Action_t revAction){
      revActions.push_back(revAction);
    }

    friend std::ostream &operator<<(std::ostream &os, const Step<Action_t> &s);
  };
  
  std::ostream &operator<<(std::ostream &os, const Step<BaseAction> &s){
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

  std::ostream &operator<<(std::ostream &os, const Step<Action> &s){
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

  struct State
  {
    // int is used in favour of Dest because
    // implicit type conversion works 
    // and there is no need to bind the enum Dest to emscripten (see wrapper.cpp)
    bool valid = true;
    /* std::unordered_map<Dest, state_canvas_t> canvases;
    std::unordered_map<Dest, InfoTableState> infotables;
    std::unordered_map<Dest, std::vector<coord_t>> vertices;
    std::unordered_map<Dest, std::vector<line_t>> edges; 
    std::unordered_map<Dest, uint8_t> arrowColor;*/
    

    std::unordered_map<int, rowf_t> canvases;
    std::unordered_map<int, InfoTableState> infotables;
    std::unordered_map<int, std::vector<coord_t>> vertices;
    std::unordered_map<int, std::vector<line_t>> edges;

    std::unordered_map<int, uint8_t> arrowColor;
    int pseudoCodeRowPri;
    int pseudoCodeRowSec;
  };

  struct RuntimeSimulation
  {
    // RuntimeSimulation keeps an active record of the current state of all items (canvases, infotables, single pixel values, arrows shown, bounds for values on canvas to track min and max values, vertices, edges)

    std::unordered_map<Dest, rowf_t> activeCanvas;
    std::unordered_map<Dest, std::unique_ptr<InfoTable>> activeTable;
    std::unordered_map<Dest, coord_t> singlePixelCanvas;
    std::unordered_map<int, uint8_t> arrowColor;
    // std::unordered_map<Dest, std::pair<double, double>> bounds;
    std::unordered_map<int, bound_t> bounds;

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