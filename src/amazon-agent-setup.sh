#!/bin/sh

sudo yum -y update --security;
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash - ;
sudo yum install -y git nodejs gcc-c++ make; # Install essential packages
sudo amazon-linux-extras install -y java-openjdk11 # Install Java to execute Jenkins agent
