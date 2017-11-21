import pandas as pd
import sys
import requests
import zerorpc
import logging

logging.basicConfig()

class HelloRPC(object):
	def func(self, name_list):
		out = []
		df = pd.read_csv("ICD9.csv")
		lidc = name_list.split(",")
		for l in lidc:
			disease_name = l
			disease_string = ' '.join(disease_name)

			for index, row in df.iterrows():
				if disease_string[1:] in row[1]:
					icd = row[0]
					break

			actualIcd = '.'.join(icd[i:i+3] for i in range(0, len(icd), 3))
			page_source = requests.get("https://apps.nlm.nih.gov/medlineplus/services/mpconnect_service.cfm?knowledgeResponseType=application/json&mainSearchCriteria.v.cs=2.16.840.1.113883.6.103&mainSearchCriteria.v.c="+actualIcd)
			plain_text = page_source.text
			out.append(plain_text)
		return out

def main():
	s = zerorpc.Server(HelloRPC())
	s.bind("tcp://127.0.0.1:4242")
	s.run()

if __name__ == '__main__':
	main()


