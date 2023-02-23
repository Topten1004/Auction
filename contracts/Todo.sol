pragma solidity 0.8.13;

contract Todo {
    // Properties
    address private owner;
    Task[] private lists;

    // Mapping
    mapping(uint256 => address) taskToOwner;

    // Event
    event LogAddItem(address indexed _sender, uint taskId);
    event LogDeleteItem(address indexed _sender, uint taskId);


    struct Task {
        uint id;
        string title;
        bool checked;
    }

    // Assign values
    constructor () {
        owner = msg.sender;
    }

    function addItem(string memory title, bool checked) external {
        uint taskId = lists.length;
        lists.push(Task(taskId, title, checked));
        taskToOwner[taskId] = msg.sender;
        emit LogAddItem(msg.sender, taskId);
    }

    function getMyTasks() external view returns (Task[] memory) {
        Task[] memory temporary = new Task[](lists.length);
        uint counter = 0;
        for(uint i = 0; i < lists.length; i++)
        {
            if(taskToOwner[i] == msg.sender && lists[i].checked == false) {
                temporary[counter] = lists[i];
                counter++;
            }
        }

        Task[] memory result = new Task[](counter);

        for(uint i=0; i<counter; i++) {
            result[i] = temporary[i];
        }
        return result;
    }

    function deleteTask(uint taskId) external {

        if(taskToOwner[taskId] == msg.sender)
        {
            lists[taskId].checked == false;
            emit LogDeleteItem(msg.sender, taskId);
        }
    }
}