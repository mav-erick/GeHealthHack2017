import requests as rq 
import pandas as pd 
import numpy as np 
from bs4 import BeautifulSoup
import re	
from string import ascii_lowercase
import zerorpc
import logging

logging.basicConfig()

class HelloRPC(object):
	def DataStatistics(self):
		lnks = []
		url = 'https://www.cdc.gov/DataStatistics/'
		
		page_source = rq.get(url)
		plain_text = page_source.text
		soup = BeautifulSoup(plain_text, "lxml")
		links = soup.findAll('div', {'class':"syndicate"})

		f = 1
		for l in links:
			link = l.findAll('a')
			for a in link:
				if (a.text == "Data.CDC.gov"):
					f = 0
					break
				lnks.append(a.text)
				lnks.append(str(a.get("href")))
			if f == 0:
				break
		return lnks

	def Trendingdisease(self):
		print("hello")		
		lst = []
		url = 'http://www.webmd.com/'
		page_source = rq.get(url)
		plain_text = page_source.text
		soup = BeautifulSoup(plain_text, "lxml")
		links = soup.findAll('div', {'class':"topSearchTerms module"})
		for l in links:
			link = l.findAll('a')
			for a in link:
				lst.append(a.text)
				lst.append(str(a.get("href")))

		return lst

	def who_india_news(self):
		lstnews = []
		url = 'http://www.who.int/countries/ind/en/'
		page_source = rq.get(url)
		plain_text = page_source.text
		soup = BeautifulSoup(plain_text, "lxml")
		links = soup.findAll('ul', {'class':"auto_archive"})
		for l in links:
			link = l.findAll('a')
			for a in link:
				lstnews.append(a.text)
				lstnews.append("http://www.who.int" + a.get("href"))
				
		return lstnews
def main():
    s = zerorpc.Server(HelloRPC())
    s.bind("tcp://127.0.0.1:4040")
    s.run()

if __name__ == "__main__" : main()