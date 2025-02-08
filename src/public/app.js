// Function to switch theme
function switchTheme(theme) {
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(theme + '-theme');
}

// Function to delete a topic
function deleteTopic(topicId) {
    if (confirm('Are you sure you want to delete this topic?')) {
        fetch(`/api/topics/${topicId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                fetchTopics(); // Refresh topics after deletion
            })
            .catch(error => console.error('Error deleting topic:', error));
    }
}

// Function to filter topics by board
function filterBoard(board) {
    fetchTopics(board);
}

document.addEventListener('DOMContentLoaded', () => {
    const topicForm = document.getElementById('topic-form');
    const topicsSection = document.getElementById('topics-section');
    const boardsSection = document.getElementById('boards');
    const popularThreadsSection = document.getElementById('popular-threads');

    // Function to fetch and display topics
    function fetchTopics(board) {
        let url = '/api/topics';
        if (board) {
            url += `/board/${encodeURIComponent(board)}`;
        }
        fetch(url)
            .then(response => response.json())
            .then(data => {
                topicsSection.innerHTML = '';
                data.forEach(topic => {
                    const topicDiv = document.createElement('div');
                    topicDiv.className = 'topic';
                    topicDiv.innerHTML = `
                        <div class="title">${topic.title}</div>
                        <div class="description">${topic.description}</div>
                        <div class="timestamp">${new Date(topic.timestamp).toLocaleString()}</div>
                        <div class="comments">
                            <h3>Comments</h3>
                            <div id="comments-${topic.id}">
                                <!-- Comments will be displayed here -->
                            </div>
                            <form id="comment-form-${topic.id}">
                                <textarea id="comment-input-${topic.id}" placeholder="Write your comment..." required></textarea>
                                <button type="submit">Submit</button>
                            </form>
                        </div>
                        <button onclick="deleteTopic(${topic.id})">Delete</button>
                    `;
                    topicsSection.appendChild(topicDiv);

                    // Fetch and display comments for this topic
                    fetchComments(topic.id);

                    // Handle comment form submission
                    const commentForm = document.getElementById(`comment-form-${topic.id}`);
                    const commentInput = document.getElementById(`comment-input-${topic.id}`);
                    commentForm.addEventListener('submit', (event) => {
                        event.preventDefault();
                        const commentText = commentInput.value.trim();
                        if (commentText) {
                            fetch(`/api/topics/${topic.id}/comments`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ text: commentText })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    commentInput.value = '';
                                    fetchComments(topic.id); // Refresh comments
                                })
                                .catch(error => console.error('Error posting comment:', error));
                        }
                    });
                });
            })
            .catch(error => console.error('Error fetching topics:', error));
    }

    // Function to fetch and display comments for a specific topic
    function fetchComments(topicId) {
        fetch(`/api/topics/${topicId}/comments`)
            .then(response => response.json())
            .then(data => {
                const commentsSection = document.getElementById(`comments-${topicId}`);
                commentsSection.innerHTML = '';
                data.forEach(comment => {
                    const commentDiv = document.createElement('div');
                    commentDiv.className = 'comment';
                    commentDiv.innerHTML = `
                        <p>${comment.text}</p>
                        <span class="timestamp">${new Date(comment.timestamp).toLocaleString()}</span>
                    `;
                    commentsSection.appendChild(commentDiv);
                });
            })
            .catch(error => console.error('Error fetching comments:', error));
    }



    // Fetch and display boards
    function fetchBoards() {
        const boards = [
            { name: 'Video Games', items: ['Video Games', 'Multiplayer', 'Mobile', 'Retro Games', 'RPG', 'Strategy'] },
            { name: 'Interests', items: ['Comics&Cartoons', 'Technology', 'Film', 'Weapons', 'Auto', 'Sports', 'Science&Math', 'History&Humanity', 'KZ Politics', 'International Politics', 'Toys', 'Outdoors', 'Anime', 'Manga', 'Cosplay'] },
            { name: 'University', items: ['General', 'Deans&Departments', 'Professors', 'System/Structure', 'Events', 'Olympiads', 'Classes', 'Clubs', 'Students', 'Work', 'For entrants'] },
            { name: 'Courses', items: ['SE', 'IT', 'BDA', 'MT', 'MCS', 'CS', 'ST', 'IoT', 'EE', 'AIB/Ite/ITM', 'DJ', "Master's Degree"] },
            { name: 'Other', items: ['Business', 'Travel', 'Fitness', 'Paranormal', 'Advice', 'LGBTQ', 'Current News', 'Memes', 'Random'] }
        ];

        boards.forEach(board => {
            const boardDiv = document.createElement('div');
            boardDiv.className = 'board';
            boardDiv.innerHTML = `<strong>${board.name}</strong><ul>`;
            board.items.forEach(item => {
                const itemLi = document.createElement('li');
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = item;
                link.onclick = () => filterBoard(item);
                itemLi.appendChild(link);
                boardDiv.querySelector('ul').appendChild(itemLi);
            });
            boardDiv.innerHTML += '</ul>';
            boardsSection.appendChild(boardDiv);
        });
    }

    // Fetch and display popular threads
    function fetchPopularThreads() {
        fetch('/api/popular-threads')
            .then(response => response.json())
            .then(data => {
                popularThreadsSection.innerHTML = '';
                data.forEach(thread => {
                    const threadDiv = document.createElement('div');
                    threadDiv.className = 'thread';
                    threadDiv.innerHTML = `
                        <div class="title">${thread.title}</div>
                        <div class="description">${thread.description}</div>
                        <div class="timestamp">${new Date(thread.timestamp).toLocaleString()}</div>
                    `;
                    popularThreadsSection.appendChild(threadDiv);
                });
            })
            .catch(error => console.error('Error fetching popular threads:', error));
    }

    // Fetch topics on page load
    fetchTopics();

    // Handle topic form submission
    topicForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const title = document.getElementById('topic-title').value.trim();
        const description = document.getElementById('topic-description').value.trim();
        const board = document.getElementById('topic-board').value;
        if (title && description && board) {
            fetch('/api/topics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: title, description: description, board: board })
            })
                .then(response => response.json())
                .then(data => {
                    document.getElementById('topic-title').value = '';
                    document.getElementById('topic-description').value = '';
                    fetchTopics(); // Refresh topics
                })
                .catch(error => console.error('Error posting topic:', error));
        }
    });

    // Fetch boards and popular threads on page load
    fetchBoards();
    fetchPopularThreads();
});