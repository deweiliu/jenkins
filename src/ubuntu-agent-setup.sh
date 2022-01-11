# Init script upon connection
#!/bin/sh

sudo apt update -y;
sudo apt upgrade -y;

# Jenkins agent requires Java
sudo apt install default-jre -y; 

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt update -y;
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose -y;

# User data
#!/bin/bash
sudo groupadd docker;
sudo usermod -aG docker ubuntu;