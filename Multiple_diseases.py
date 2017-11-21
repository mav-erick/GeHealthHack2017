import requests
from bs4 import BeautifulSoup
import sys
import re, cgi
from rake import pgrank
import zerorpc
import logging
from multiprocessing import Pool
logging.basicConfig()

def crawlwebmd(s):
	symp_str = []
	url = 'http://www.webmd.com/search/2/results?query='
	for i in s:
		url += i + " "
	url = url[:len(url)-1]
	url = url.replace(" ", "_")
	page_source = requests.get(url)
	plain_text = page_source.text
	soup = BeautifulSoup(plain_text, "lxml")
	
	links = soup.findAll('div', {'class':"module-content"}) 
	i = 0
	for l in links:
		link = l.findAll('a')
		for a in link:
			if i < 5 :
				i += 1
			else:
				break
			symp_str.append(a.text)
			if(a.get("href")[0] == 'h'):
				symp_str.append(a.get("href"))
			else:
				symp_str.append("http://www.webmd.com" + a.get("href"))
			#print symp_str[len(symp_str)-1]
		if(i >= 5):
			break
	return(symp_str)

def crawlcdc(s):
	symp_str = []
	url = 'https://search.cdc.gov/search?query='
	for i in s:
		url += i + " "
	url = url[:len(url)-1]
	url += '&utf8=%E2%9C%93&affiliate=cdc-main'
	url = url.replace(" ", "%20")
	
	page_source = requests.get(url)
	plain_text = page_source.text
	soup = BeautifulSoup(plain_text, "lxml")
	links = soup.findAll('div', {'id':"results"})
	i = 0
	for l in links:
		link = l.findAll('a')
		for a in link:
			if i < 5 :
				i += 1
			else:
				break
			symp_str.append(a.text)
			symp_str.append(a.get("href"))
			#print symp_str[len(symp_str)-1]
		if(i >= 5):
			break
	return(symp_str)



class HelloRPC(object):
	def func(self, sstring):
		List_Links = []
		inp_lst = []
		lst = []
		
		inp_lst = sstring.split(" ")
		keywords = inp_lst
		base_url = 'https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term='
		url = base_url + ' '.join(keywords)
		page_source = requests.get(url)
		plain_text = page_source.text
		bs_obj = BeautifulSoup(plain_text, "lxml")
		#print (bs_obj.term.string)
		hotchick = bs_obj.find('document')
		#print (hotchick.text)
		lst.append(hotchick.text)
		List_Links += crawlwebmd(inp_lst)
		List_Links += crawlcdc(inp_lst)
		pgrnk = {}
		for i in range(0, len(List_Links), 2) :
			print List_Links[i+1]
			page_source = requests.get(List_Links[i+1])
			plain_text = page_source.text
			soup = BeautifulSoup(plain_text, "lxml")
			lin = soup.findAll('p')
			tx = ""
			for txt in lin:
				tx += txt.text
			pgrnk[pgrank(tx, sstring)] = List_Links[i] + ":" + List_Links[i+1]

		for key in sorted(pgrnk, reverse=True):
			lst.append(pgrnk[key].split(":", 1)[0])
			lst.append(pgrnk[key].split(":", 1)[1])
		return lst


def main():
	s = zerorpc.Server(HelloRPC())
	s.bind("tcp://127.0.0.1:4141")
	s.run()

if __name__ == '__main__':
	main()

	# disease_list = open("disease.txt").readlines()
	# for it in disease_list :
	# 	crawlwiki(it[:len(it) - 1])
