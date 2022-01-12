#!/bin/sh

sudo yum -y update --security;
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash - ;
sudo yum install -y git nodejs gcc-c++ make; # Install essential packages
sudo yum install -y java-1.8.0-openjdk; # Install Java to execute Jenkins agent