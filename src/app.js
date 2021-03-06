
const App = {
    loading: false,
    contracts: {},

    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.registerEvents()
        await App.render()
    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                // Request account access if needed
                await ethereum.enable()
                // Acccounts now exposed
                web3.eth.sendTransaction({/* ... */ })
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({/* ... */ })
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async () => {
        // Set the current blockchain account
        web3.eth.getAccounts((error, result) => {
            if (error) {
                console.log(error)
            } else {
                App.account = result[0]
            }
        })
    },

    loadContract: async () => {
        // Create a JavaScript version of the smart contract
        const todoList = await $.getJSON('TodoList.json')
        App.contracts.TodoList = TruffleContract(todoList)
        App.contracts.TodoList.setProvider(App.web3Provider)

        // Hydrate the smart contract with values from the blockchain
        App.todoList = await App.contracts.TodoList.deployed()
    },

    registerEvents: async() => {

        App.todoList.TaskCreated((error, result) => {
            if(error) {
                console.log(error)
            } else {
                console.log('TaskCreated Event:', result);
                App.setLoading(false)
                App.render()
            }
        })

        App.todoList.TaskToggled((error, result) => {
            if(error) {
                console.log(error)
            } else {
                console.log('TaskToggled Event:', result);
                App.setLoading(false)
                App.render()
            }
        })

        App.todoList.TaskDeleted((error, result) => {
            if(error) {
                console.log(error)
            } else {
                console.log('TaskDeleted Event:', result);
                App.setLoading(false)
                App.render()
            }
        })
    },

    render: async () => {
        // Prevent double render
        if (App.loading) {
            return
        }

        // Update app loading state
        App.setLoading(true)

        // Render Account
        $('#account').html(App.account).on('click', (e) => {
            navigator.clipboard.writeText(e.target.innerHTML)
        })

        // Render Tasks
        await App.renderTasks()

        // Update loading state
        App.setLoading(false)
    },

    createTask: async () => {
        const content = $('#newTask').val()
        if (content.length == 0) {
            return
        }
        App.setLoading(true)
        App.todoList.createTask(content, { from: App.account })
    },

    deleteTask: async (e) => {
        App.setLoading(true)
        const taskId = e.target.name
        await App.todoList.deleteTask(taskId, { from: App.account })
    },

    renderTasks: async () => {

        // empty the lists
        $('#completedTaskList').empty()
        $('#taskList').empty()

        // Load the total task count from the blockchain
        const taskCount = await App.todoList.accountTasksCount(App.account)
        const $taskTemplate = $('.taskTemplate')

        // Render out each task with a new task template
        for (var i = 0;i < taskCount;i++) {
            // Fetch the task data from the blockchain
            const task = await App.todoList.accountTask(App.account, i)
            if(task.deleted) {
                continue
            }
            const taskId = task[0]
            const taskContent = task[1]
            const taskCompleted = task[2]

            // Create the html for the task
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
                .prop('name', taskId)
                .prop('checked', taskCompleted)
                .on('click', App.toggleCompleted)

            $newTaskTemplate.find('button')
                .prop('name', taskId)
                .on('click', App.deleteTask)

            // Put the task in the correct list
            if (taskCompleted) {
                $('#completedTaskList').append($newTaskTemplate)
            } else {
                $('#taskList').append($newTaskTemplate)
            }

            // Show the task
            $newTaskTemplate.show()
        }
    },

    toggleCompleted: async (e) => {
        App.setLoading(true)
        const taskId = e.target.name
        await App.todoList.toggleTask(taskId, { from: App.account })
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    }
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})