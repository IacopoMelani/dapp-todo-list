// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract TodoList {
    event TaskCreated(
        uint256 indexed taskId,
        address indexed from,
        string taskName
    );

    event TaskDeleted(
        uint256 indexed taskId,
        address indexed from,
        string taskName
    );

    event TaskToggled(
        uint256 indexed taskId,
        address indexed from,
        string taskName,
        bool isCompleted
    );

    struct Task {
        uint256 id;
        string content;
        bool completed;
        bool deleted;
    }

    mapping(address => uint256) tasksCount;
    mapping(address => mapping(uint256 => Task)) tasks;

    function accountTask(address _account, uint256 _taskId)
        public
        view
        returns (Task memory)
    {
        require(_taskId < tasksCount[_account], "Task does not exist");
        return tasks[_account][_taskId];
    }

    function accountTasks(address _account)
        public
        view
        returns (Task[] memory)
    {
        Task[] memory result = new Task[](tasksCount[_account]);
        for (uint256 i = 0; i < tasksCount[_account]; i++) {
            result[i] = tasks[_account][i];
        }
        return result;
    }

    function accountTasksCount(address _account) public view returns (uint256) {
        return tasksCount[_account];
    }

    function createTask(string memory _content) public {
        require(bytes(_content).length > 0, "Task content cannot be empty");
        tasks[msg.sender][tasksCount[msg.sender]] = Task(
            tasksCount[msg.sender],
            _content,
            false,
            false
        );
        tasksCount[msg.sender]++;
        emit TaskCreated(tasksCount[msg.sender], msg.sender, _content);
    }

    function deleteTask(uint256 _taskId) public {
        require(
            accountTask(msg.sender, _taskId).deleted == false,
            "Task already deleted"
        );
        tasks[msg.sender][_taskId].deleted = true;
        emit TaskDeleted(
            _taskId,
            msg.sender,
            accountTask(msg.sender, _taskId).content
        );
    }

    function toggleTask(uint256 _id) public {
        require(_id < tasksCount[msg.sender], "Task does not exist");

        tasks[msg.sender][_id].completed = !tasks[msg.sender][_id].completed;
        emit TaskToggled(
            _id,
            msg.sender,
            tasks[msg.sender][_id].content,
            tasks[msg.sender][_id].completed
        );
    }
}
