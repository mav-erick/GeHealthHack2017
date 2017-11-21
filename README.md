# GeHealthHack2017
Code written as a part of GEHealthHack 2017

This is a NodeJS app for Contextual Learning Platform for Medical Professionals. 
It was written as a part of GE Health Hack 2017 organized by HackerEarth. 

What the code does?
--------------------

Given an input medical term (it could be a disease, symptom, medicine etc), it crawls trusted web sources and in real time fetches
the relevant search results. It uses an advanced content filtering and ranking algorithm to fetch the relevant content.

The backend is in Python, it talks to the NodeJS client using RPC protocol enabling two way communication, and
is powered by a light-weight ZeroRPC server. There are some pretty slick webcrawlers written using BeautfulSoup as well.

Buried inside you will find awesome resources for your next hackathon.
