#ifndef PARSEMAP_HPP
#define PARSEMAP_HPP

#include <iostream>
#include <fstream>
#include <vector>
#include <string>

std::vector<std::string> split(std::string &s, std::string delim){
	std::vector<std::string> tokens;

	int idx = 0;
	int nxt;
			
	while(idx < s.size()){
		nxt = s.find(delim, idx);
		if(nxt == -1) nxt = s.size();
		tokens.push_back(s.substr(idx, nxt - idx));
		idx = nxt + 1;
	}
	
	return tokens;
}

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

std::array<int, 4> parseScen(std::string fname, int num){
	std::ifstream file(fname);
	std::string line;

	if (file.is_open())
	{
		// read version
		std::getline(file, line);
		std::cout<<line<<std::endl;

		// Read map
		while(std::getline(file, line))
		{
			if(num-- > 1) continue;
			std::vector<std::string> tokens = split(line, "\t");
			if(tokens.size() < 9) break;
			std::array<int, 4> ret;
			ret[0] = stoi(tokens[5]);
			ret[1] = stoi(tokens[4]);
			ret[2] = stoi(tokens[7]);
			ret[3] = stoi(tokens[6]);
			return ret;
		}
	}
	else{
		std::cout<<"File cannot be opened.\n";
	}
	return {-1, -1, -1, -1};
}

#endif