#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include "solver.h"
#include "generator.h"

namespace py = pybind11;

PYBIND11_MODULE(sudoku_solver, m) {
    m.def("count_solutions", [](Board board_copy) -> int {
        return count_solutions(board_copy);
    }, "Counts the number of solutions for a given board.");

    m.doc() = "High-performance Sudoku solver and generator core";
    
    m.def("solve_puzzle", [](Board board_copy) -> py::object {
        
        bool solved = solve_puzzle_function(board_copy);
        
        if (solved) {
            return py::cast(board_copy);
        } else {
            return py::none();
        }
    }, "Solves a Sudoku puzzle and returns the solved board.");

    
    m.def("generate_puzzle", &generate_puzzle_function, "Generates a new puzzle (takes difficulty string)");
}