#include <iostream>
#include <vector>
#include <stdexcept>
#include "../pathfinder/infotable.hpp"

int main() {
    InfoTable table("exampleTable", 3);
    table.setTableHeader({"Column 1", "Column 2", "Column 3"});
    std::cout<<table.insertRowAtIndex(1, {"Value 1", "Value 2", "Value 3"})<<std::endl;
    std::cout<<table.insertRowAtIndex(2, {"Value 4", "Value 5", "Value 6"})<<std::endl;
    std::cout<<table.insertRowAtIndex(3, {"Value 7", "Value 8", "Value 9"})<<std::endl;
    
    std::cout<<table.insertRowAtIndex(2, {"Value 10", "Value 11", "Value 12"})<<std::endl;

    table.peek();

    std::vector<std::string> updatedValues = {"New Value 1", "New Value 2", "New Value 3"};
    for(auto s : updatedValues) std::cout<<s<<' ';
    std::cout<<std::endl;
    std::vector<std::string> prevValues = table.updateRowAtIndex(1, updatedValues);
    
    for(auto s : prevValues) std::cout<<s<<' ';
    std::cout<<std::endl;

    table.peek();

    std::vector<std::string> erasedValues = table.eraseRowAtIndex(1);
    
    for(auto s : erasedValues) std::cout<<s<<' ';
    std::cout<<std::endl;

    table.peek();

    int highlightIndex = table.setHighlightAtIndex(2);

    std::cout<<highlightIndex;

    table.peek();

    table.removeFromDom();
    return 0;
}
