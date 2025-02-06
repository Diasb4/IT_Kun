document.addEventListener('DOMContentLoaded', () => {
    const topicForm = document.getElementById('topic-form');
    const topicsSection = document.getElementById('topics-section');

    // Function to fetch and display topics
    function fetchTopics() {
        fetch('/api/topics')
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

    // Fetch topics on page load
    fetchTopics();

    // Handle topic form submission
    topicForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const title = document.getElementById('topic-title').value.trim();
        const description = document.getElementById('topic-description').value.trim();
        if (title && description) {
            fetch('/api/topics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: title, description: description })
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
});