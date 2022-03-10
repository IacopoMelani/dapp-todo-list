const { assert } = require('chai')

const TodoList = artifacts.require('./TodoList.sol')

contract('TodoList', (accounts) => {

    before(async () => {
        this.todoList = await TodoList.deployed()
    })

    it('deploys successfully', async () => {
        const address = await this.todoList.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })

    it('create task', async () => {
        await this.todoList.createTask('Buy Milk')
        let tasks = await this.todoList.accountTasks(accounts[0])
        assert.equal(tasks.length, 1)
        assert.equal(tasks[0].id, 0)
        assert.equal(tasks[0].content, 'Buy Milk')
        assert.equal(tasks[0].completed, false)

        await this.todoList.createTask('Go to gym')
        tasks = await this.todoList.accountTasks(accounts[0])
        assert.equal(tasks.length, 2)
        assert.equal(tasks[1].id, 1)
        assert.equal(tasks[1].content, 'Go to gym')
        assert.equal(tasks[1].completed, false)
    })

    it('toggle task', async () => {

        await this.todoList.createTask('Buy Milk')
        await this.todoList.createTask('Go to gym')

        await this.todoList.toggleTask(0)
        let task = await this.todoList.accountTask(accounts[0], 0)
        assert.equal(task.completed, true)

        await this.todoList.toggleTask(1)
        task = await this.todoList.accountTask(accounts[0], 1)
        assert.equal(task.completed, true)

        await this.todoList.toggleTask(0)
        task = await this.todoList.accountTask(accounts[0], 0)
        assert.equal(task.completed, false)

        await this.todoList.toggleTask(1)
        task = await this.todoList.accountTask(accounts[0], 1)
        assert.equal(task.completed, false)
    })

    it("delete task", async () => {

        await this.todoList.createTask('Buy Milk')
        await this.todoList.createTask('Go to gym')

        await this.todoList.deleteTask(0)
        let tasks = await this.todoList.accountTasks(accounts[0])
        assert.equal(tasks[0].deleted, true)

        await this.todoList.deleteTask(1)
        tasks = await this.todoList.accountTasks(accounts[0])
        assert.equal(tasks[1].deleted, true)
    })
})