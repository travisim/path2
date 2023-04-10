#include <iostream>
#include <fstream>
#include <sstream>
#include <assert.h>

#pragma once
#define LOG_PATH "dbg.log"

#define PATH_DEBUG 1

namespace pathfinder
{
#if PATH_DEBUG
    struct __Debug
    {
        std::ofstream log;
        int tabs;

        __Debug(const std::string &log_path) : log(log_path), tabs(0) {}
        void inc() { ++tabs; }
        void dec() { --tabs; }

        std::string printTabs()
        {
            std::ostringstream ss;
            for (int i = 0; i < tabs; ++i)
                ss << "\u2506 ";
            return ss.str();
        }
    };
    extern __Debug __dbg;

#define _dbginc ++__dbg.tabs;
#define _dbgdec --__dbg.tabs;
#define __dbgw(x)   \
    std::cout << x; \
    __dbg.log << x;
#define _dbg11(x)                                   \
    do                                              \
    {                                               \
        __dbgw(__dbg.printTabs() << x << std::endl) \
    } while (0)
#define _dbg01(x)              \
    do                         \
    {                          \
        __dbgw(x << std::endl) \
    } while (0)

#define _dbg10(x)                      \
    do                                 \
    {                                  \
        __dbgw(__dbg.printTabs() << x) \
    } while (0)
#define _dbg00(x) \
    do            \
    {             \
        __dbgw(x) \
    } while (0)
#define _dbgtitle(x)                                                                                                    \
    do                                                                                                                  \
    {                                                                                                                   \
        __dbgw(__dbg.printTabs() << "\u250c\u2504\u2504 " << x << " \u2504\u2504\u2504\u2504\u2504\u2504" << std::endl) \
    } while (0)
#define _dbgtitleheavy(x)                                                                                               \
    do                                                                                                                  \
    {                                                                                                                   \
        __dbgw(__dbg.printTabs() << "\u250f\u2505\u2505 " << x << " \u2505\u2505\u2505\u2505\u2505\u2505" << std::endl) \
    } while (0)
#define _dbghelp std::cout << "help" << std::endl
#else
#define _dbginc
#define _dbgdec
#define _dbg11(x)
#define _dbg01(x)
#define _dbg10(x)
#define _dbg00(x)
#define _dbgtitle(x)
#define _dbgtitleheavy(x)
#define _dbghelp
#endif
}