#include <iostream>
#include <fstream>
#include <vector>
#include <string>

std::vector<std::vector<uint8_t>> parseMap(std::string fname){
	std::ifstream file(fname);
	std::string line;
	std::vector<std::vector<uint8_t>> grid;

	if (file.is_open())
	{
		// Read type
		std::getline(file, line);
		// Read height
		std::getline(file, line);
		int height = std::stoi(line.substr(line.find(" ") + 1));
		// Read width
		std::getline(file, line);
		int width = std::stoi(line.substr(line.find(" ") + 1));

		// read map
		std::getline(file, line);

		// Read map
		for (int i = 0; i < height; ++i)
		{
			std::getline(file, line);
			std::vector<uint8_t> row;
			for (int j = 0; j < width; ++j)
			{
				if (line[j] == '.')
				{
					row.push_back(1);
				}
				else if (line[j] == '@')
				{
					row.push_back(0);
				}
			}
			grid.push_back(row);
		}
		return grid;
	}
	else{
		std::cout<<"File cannot be opened.\n";
	}
	return {};
}
