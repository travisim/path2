#include <iostream>
#include <utility>

using coordInt_t = std::pair<double, double>;

// Define the Action struct template
template <typename CoordType>
struct Action {
  using Type = CoordType;
    // Your Action struct implementation here
};

// Define the BaseAction struct template
template <typename CoordType>
struct BaseAction {
    // Your BaseAction struct implementation here
};

// Define the Pathfinder class template
template <typename Action_type>
class Pathfinder {
public:
    // Access the CoordType from the Action_type using type traits
    using CoordType = typename Action_type::Type;

    void test(){ std::cout<<sizeof(CoordType)<<std::endl; }
    // Rest of your Pathfinder class implementation here
};

int main() {
    // Example usage
    using MyActionType = Action<coordInt_t>;  // or Action<float>
    Pathfinder<MyActionType> pathfinder;

    // You can now access the CoordType within the Pathfinder class
    using CoordType = typename decltype(pathfinder)::CoordType;

    std::cout<<sizeof(CoordType)<<std::endl;

    pathfinder.test();

    // Rest of your code here
    return 0;
}
