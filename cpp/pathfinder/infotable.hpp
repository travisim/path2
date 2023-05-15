#include <iostream>
#include <vector>
#include <algorithm>

#ifndef INFOTABLE_HPP
#define INFOTABLE_HPP


struct InfoTableState{
    int rowSize;
    int highlightedRow;
    std::vector<std::vector<std::string>> rows;
};


class InfoTable
{
    static const int null = -1;
public:
    InfoTable(int rowSize) : rowSize(rowSize) {}

    void removeFromDom()
    {
        // remove table from DOM
    }

    void wrongRowSizeHandler(int providedSize)
    {
        std::string msg = "Wrong Infotable row size, provided: " + std::to_string(providedSize) + ", correct: " + std::to_string(rowSize);
        throw std::runtime_error(msg);
    }

    void setTableHeader(std::vector<std::string> headers)
    {
        this->headers = headers;
    }

    void setTableActive()
    {
        // show table on the web page
    }

    bool empty()
    {
        return rows.empty();
    }

    void removeAllTableRows()
    {
        rows.clear();
    }

    int getHiglightIndex()
    {
        return highlightRow;
    }

    int resetAllHighlight(){
        int prevHighlight = highlightRow;
        highlightRow = null;
        return prevHighlight;
    }

    int setHighlightAtIndex(int rowIndex = null)
    {
        int prevHighlight = resetAllHighlight();
        if(rowIndex != null){
            highlightRow = rowIndex;
        }
        return prevHighlight;
    }

    int insertRowAtIndex(int rowIndex, std::vector<std::string> values)
    {
        // std::cout << "given size: " << values.size() << ", correct size: " << rowSize << std::endl;
        if (values.size() != this->rowSize)
        {
            wrongRowSizeHandler(values.size());
            return -1;
        }

        bool toHighlight = (rowIndex > 0);
        rowIndex = abs(rowIndex) - 1;
        // std::cout << "row index: " << rowIndex << std::endl;

        if (rowIndex == 0)
        {
            rows.insert(rows.begin(), values);
        }
        else if (rows.empty() || rowIndex == rows.size())
        {
            rows.push_back(values);
        }
        else if (rowIndex > rows.size())
        {
            return 0;
        }
        else
        {
            rows.insert(rows.begin() + rowIndex, values);
        }

        if (toHighlight)
        {
            return setHighlightAtIndex(rowIndex + 1);
        }

        int prevHighlight = highlightRow;
        if (rowIndex + 1 <= highlightRow)
        {
            ++highlightRow;
        }
        return prevHighlight;
    }

    std::vector<std::string> eraseRowAtIndex(int rowIndex)
    {
        rowIndex = abs(rowIndex) - 1;
        if (rowIndex >= rows.size() || rows.size() < 1)
        {
            return {};
        }
        std::vector<std::string> values = rows[rowIndex];

        bool highlighted = (highlightRow == rowIndex + 1);

        if(rowIndex + 1 < highlightRow) highlightRow--;
        else if(rowIndex + 1 == highlightRow) highlightRow = null;

        if (highlighted)
            values.push_back("1");
        else
            values.push_back("0");
        rows.erase(rows.begin() + rowIndex);
        return values;
    }

    std::vector<std::string> updateRowAtIndex(int rowIndex, std::vector<std::string> values)
    {
        if (values.size() != this->rowSize)
        {
            wrongRowSizeHandler(values.size());
            return {};
        }

        bool toHighlight = (rowIndex > 0);
        rowIndex = abs(rowIndex) - 1;

        if (rowIndex >= rows.size() || rows.size() < 1)
        {
            std::cout << "row index does not exist yet\n";
            return {};
        }
        std::vector<std::string> prevValues = rows[rowIndex];
        rows[rowIndex] = values;
        int prevHighlight;
        if (toHighlight)
        {
            prevHighlight = setHighlightAtIndex(rowIndex + 1);
        }
        else{
            prevHighlight = resetAllHighlight();
        }
        prevValues.push_back(std::to_string(prevHighlight));

        return prevValues;
    }

    void peek()
    {
        std::cout << "\nPEEKING:\n\n";
        for (int i = 0; i < rows.size(); i++)
        {
            for (auto &s : rows[i])
            {
                std::cout << s << ' ';
            }
            if (i + 1 == highlightRow)
                std::cout << "true";
            std::cout << std::endl;
        }
        std::cout << "\nEND OF PEEK\n\n";
    }

    void getCurrentState(InfoTableState &its){
        its = {rowSize, highlightRow, rows};
    }

private:
    int rowSize;
    std::vector<std::string> headers;
    std::vector<std::vector<std::string>> rows;
    int highlightRow = -1;
};

#endif